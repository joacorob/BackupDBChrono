import { MongoClient } from "mongodb";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";
import tar from "tar";

export async function backupMongodb(url, destPath) {
  const mongoUrl = new URL(url);
  const dbName = mongoUrl.pathname.slice(1);
  const tempDir = path.join(path.dirname(destPath), `temp-${Date.now()}`);

  try {
    // Create temporary directory for dump
    await fs.mkdir(tempDir, { recursive: true });

    // Connect to get authentication details
    const client = new MongoClient(url);
    await client.connect();

    try {
      // Get authentication details
      const credentials = client.options;
      const host = credentials.hosts[0];
      const username = credentials.credentials?.username;
      const password = credentials.credentials?.password;
      const authSource = credentials.source || "admin";

      // Prepare mongodump command
      const mongodumpArgs = [
        `--uri="${url}"`,
        `--archive="${destPath}"`,
        "--gzip",
      ];

      // Execute mongodump
      const result = await new Promise((resolve, reject) => {
        const mongodump = spawn("mongodump", mongodumpArgs, {
          shell: true,
        });

        let errorOutput = "";

        mongodump.stdout.on("data", (data) => {
          console.log(`mongodump stdout: ${data}`);
        });

        mongodump.stderr.on("data", (data) => {
          errorOutput += data.toString();
          console.error(`mongodump stderr: ${data}`);
        });

        mongodump.on("close", (code) => {
          if (code !== 0) {
            reject(
              new Error(`mongodump failed with code ${code}: ${errorOutput}`)
            );
          } else {
            resolve();
          }
        });
      });

      console.log(`MongoDB backup completed for ${dbName}`);
    } finally {
      await client.close();
    }
  } catch (error) {
    console.error("MongoDB backup error:", error);
    throw error;
  } finally {
    // Cleanup: Remove temporary directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error("Error cleaning up temp directory:", error);
    }
  }
}
