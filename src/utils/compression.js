import AdmZip from "adm-zip";
import path from "path";
import fs from "fs/promises";

export async function compressFile(filePath) {
  const zip = new AdmZip();
  const originalFileName = path.basename(filePath);
  const zipPath = filePath.replace(path.extname(filePath), ".zip");

  // Add file to zip
  zip.addLocalFile(filePath);

  // Write zip file
  zip.writeZip(zipPath);

  // Remove original file
  await fs.unlink(filePath);

  return zipPath;
}
