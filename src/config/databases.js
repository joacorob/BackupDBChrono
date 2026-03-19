const dbsUrls = process.env.DBS;

export const databases = dbsUrls.split(",").map((entry) => {
  const [url, alias] = entry.split("#");
  const type = url.split(":")[0];
  const name = alias || url.split("/")[url.split("/").length - 1];
  return { name, url, type };
});
