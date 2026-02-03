export const normalizeEntities = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ")
    .replace(/\[&hellip;\]/g, "…")
    .replace(/&quot;?/g, "\"");
};
