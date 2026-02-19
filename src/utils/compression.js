import { createGzip } from "zlib";
import { createReadStream, createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import fs from "fs/promises";

export async function compressFile(filePath) {
  const gzPath = filePath + ".gz";

  await pipeline(
    createReadStream(filePath),
    createGzip(),
    createWriteStream(gzPath)
  );

  // Remove original file
  await fs.unlink(filePath);

  return gzPath;
}
