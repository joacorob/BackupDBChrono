import mysql from "mysql2/promise";
import fs from "fs/promises";

function formatValue(value) {
  if (value === null) return "NULL";

  if (value instanceof Date) {
    // Handle invalid dates
    if (isNaN(value.getTime())) {
      return "'0000-00-00 00:00:00'";
    }
    // Format valid dates
    const pad = (num) => num.toString().padStart(2, "0");
    const year = value.getFullYear();
    const month = pad(value.getMonth() + 1);
    const day = pad(value.getDate());
    const hours = pad(value.getHours());
    const minutes = pad(value.getMinutes());
    const seconds = pad(value.getSeconds());
    return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}'`;
  }

  if (typeof value === "string") {
    return `'${value.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  }

  if (Buffer.isBuffer(value)) {
    return `X'${value.toString("hex")}'`;
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value === undefined) {
    return "NULL";
  }

  if (value && typeof value === "object") {
    // JSON/geometry/etc: serialize to JSON and escape quotes/backslashes
    const json = JSON.stringify(value);
    return `'${json.replace(/'/g, "''").replace(/\\/g, "\\\\")}'`;
  }

  return value;
}

export async function backupMysql(url, destPath) {
  const connection = await mysql.createConnection(url);
  const writeStream = await fs.open(destPath, "w");

  try {
    // Extract database name from URL
    const dbName = new URL(url).pathname.slice(1);

    // Write header
    await writeStream.write("-- MySQL dump\n");
    await writeStream.write(`-- Database: ${dbName}\n`);
    await writeStream.write(
      "-- ------------------------------------------------------------\n\n"
    );

    // Set SQL Mode to handle invalid dates
    await writeStream.write(
      'SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO,ALLOW_INVALID_DATES";\n'
    );
    await writeStream.write('SET time_zone = "+00:00";\n\n');
    await writeStream.write("SET NAMES utf8mb4;\n\n");

    // Get all tables
    const [tables] = await connection.query("SHOW TABLES");

    for (const tableRow of tables) {
      const tableName = tableRow[Object.keys(tableRow)[0]];

      await writeStream.write(
        `--\n-- Table structure for table \`${tableName}\`\n--\n\n`
      );

      // Drop table if exists
      await writeStream.write(`DROP TABLE IF EXISTS \`${tableName}\`;\n`);

      // Get create table statement
      const [createTable] = await connection.query(
        `SHOW CREATE TABLE \`${tableName}\``
      );
      await writeStream.write(`${createTable[0]["Create Table"]};\n\n`);

      // Get table data
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);

      if (rows.length > 0) {
        await writeStream.write(
          `--\n-- Dumping data for table \`${tableName}\`\n--\n\n`
        );

        // Generate insert statements in batches
        const batchSize = 1000;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const values = batch.map((row) => {
            const rowValues = Object.values(row).map(formatValue);
            return `(${rowValues.join(", ")})`;
          });

          const columns = Object.keys(rows[0])
            .map((key) => `\`${key}\``)
            .join(", ");
          await writeStream.write(
            `INSERT INTO \`${tableName}\` (${columns}) VALUES\n`
          );
          await writeStream.write(`${values.join(",\n")};\n\n`);
        }
      }
    }

    // Write stored procedures
    const [procedures] = await connection.query(
      "SELECT ROUTINE_NAME, ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ?",
      [dbName]
    );

    if (procedures.length > 0) {
      await writeStream.write("--\n-- Stored Procedures\n--\n\n");
      await writeStream.write("DELIMITER //\n\n");

      for (const proc of procedures) {
        await writeStream.write(
          `DROP PROCEDURE IF EXISTS \`${proc.ROUTINE_NAME}\`//\n`
        );
        await writeStream.write(
          `CREATE PROCEDURE \`${proc.ROUTINE_NAME}\`\n${proc.ROUTINE_DEFINITION}//\n\n`
        );
      }

      await writeStream.write("DELIMITER ;\n\n");
    }

    // Write views
    const [views] = await connection.query(
      "SELECT TABLE_NAME, VIEW_DEFINITION FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = ?",
      [dbName]
    );

    if (views.length > 0) {
      await writeStream.write("--\n-- Views\n--\n\n");

      for (const view of views) {
        await writeStream.write(
          `DROP VIEW IF EXISTS \`${view.TABLE_NAME}\`;\n`
        );
        await writeStream.write(
          `CREATE VIEW \`${view.TABLE_NAME}\` AS ${view.VIEW_DEFINITION};\n\n`
        );
      }
    }

    // Write triggers
    const [triggers] = await connection.query("SHOW TRIGGERS");

    if (triggers.length > 0) {
      await writeStream.write("--\n-- Triggers\n--\n\n");
      await writeStream.write("DELIMITER //\n\n");

      for (const trigger of triggers) {
        await writeStream.write(
          `DROP TRIGGER IF EXISTS \`${trigger.Trigger}\`//\n`
        );
        await writeStream.write(
          `CREATE TRIGGER \`${trigger.Trigger}\` ${trigger.Timing} ${trigger.Event} ON \`${trigger.Table}\`\n FOR EACH ROW\n${trigger.Statement}//\n\n`
        );
      }

      await writeStream.write("DELIMITER ;\n");
    }
  } finally {
    await writeStream.close();
    await connection.end();
  }
}
