import { spawn } from "child_process";

export async function backupPostgres(url, destPath) {
  return new Promise((resolve, reject) => {
    const pgDump = spawn(
      "/usr/lib/postgresql/15/bin/pg_dump",
      ["--no-owner", "--no-acl", "--schema=public", "-f", destPath, url],
      { shell: true }
    );

    let errorOutput = "";

    pgDump.stdout.on("data", (data) => {
      console.log(`pg_dump stdout: ${data}`);
    });

    pgDump.stderr.on("data", (data) => {
      errorOutput += data.toString();
      console.error(`pg_dump stderr: ${data}`);
    });

    pgDump.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`pg_dump failed with code ${code}: ${errorOutput}`));
      } else {
        const dbName = new URL(url).pathname.slice(1);
        console.log(`PostgreSQL backup completed for ${dbName}`);
        resolve();
      }
    });
  });
}
