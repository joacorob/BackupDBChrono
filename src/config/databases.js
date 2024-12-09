const dbsUrls = process.env.DBS;

export const databases = dbsUrls.split(",").map((url) => {
  const type = url.split(":")[0];
  const name = url.split("/")[url.split("/").length - 1];
  return { name, url, type };
});
