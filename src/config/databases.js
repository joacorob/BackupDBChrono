const dbsUrls = process.env.DBS;

export const databases = dbsUrls.split(",").map((entry) => {
  const [url, alias] = entry.split("#");
  const type = url.split(":")[0];
  const name = alias || url.split("/").pop().split("?")[0];
  return { name, url, type };
});
