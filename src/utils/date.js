const GREGORIAN_FORMATTER = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const HEBREW_FORMATTER = new Intl.DateTimeFormat("he-IL-u-ca-hebrew-nu-hebr", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatDateWithHebrew = (value) => {
  if (!value) {
    return "ללא תאריך";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "ללא תאריך";
  }
  const gregorian = GREGORIAN_FORMATTER.format(date);
  const hebrew = HEBREW_FORMATTER.format(date);
  return `${gregorian} · ${hebrew}`;
};
