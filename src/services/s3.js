import {
  S3Client,
  PutObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION
// });

const s3Client = new S3Client({
  endpoint: "https://sfo3.digitaloceanspaces.com",
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(filePath, dbName) {
  const fileStats = await fs.stat(filePath);
  const fileStream = createReadStream(filePath);
  const fileName = path.basename(filePath);

  const key = `${dbName}/${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentLength: fileStats.size,
      ContentType: "application/gzip",
      ACL: "public-read",
    })
  );

  // Copy as latest so there's always a fixed URL
  const latestKey = `${dbName}/latest.gz`;
  await s3Client.send(
    new CopyObjectCommand({
      Bucket: process.env.S3_BUCKET,
      CopySource: `${process.env.S3_BUCKET}/${key}`,
      Key: latestKey,
      ContentType: "application/gzip",
      ACL: "public-read",
      MetadataDirective: "REPLACE",
    })
  );

  const baseUrl = `https://${process.env.S3_BUCKET}.sfo3.digitaloceanspaces.com`;
  return { url: `${baseUrl}/${key}`, latestUrl: `${baseUrl}/${latestKey}` };
}

export async function cleanupOldBackups(dbName) {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: `${dbName}/`,
    })
  );

  if (!response.Contents) return;

  const backups = response.Contents
    .filter((file) => /\.(zip|gz|archive)$/.test(file.Key) && !file.Key.includes("latest"))
    .sort((a, b) => b.LastModified - a.LastModified);

  // Keep only the last 3 backups
  const backupsToDelete = backups.slice(3);

  for (const backup of backupsToDelete) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: backup.Key,
      })
    );
  }
}
