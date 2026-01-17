const GREGORIAN_FORMATTER = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const HEBREW_FORMATTER = new Intl.DateTimeFormat("he-IL-u-ca-hebrew-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const GERESH = "׳";
const GERSHAYIM = "״";
const ONES = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
const TENS = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
const HUNDREDS = ["", "ק", "ר", "ש"];

const formatHebrewLetters = (letters) => {
  if (!letters) {
    return "";
  }
  if (letters.length === 1) {
    return `${letters}${GERESH}`;
  }
  return `${letters.slice(0, -1)}${GERSHAYIM}${letters.slice(-1)}`;
};

const numberToHebrewLetters = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) {
    return "";
  }

  const thousands = Math.floor(number / 1000);
  let remainder = number % 1000;
  let result = "";

  if (thousands > 0) {
    result = `${ONES[thousands]}${GERESH}`;
    if (remainder === 0) {
      return result;
    }
    result += " ";
  }

  let letters = "";
  while (remainder >= 400) {
    letters += "ת";
    remainder -= 400;
  }

  const hundreds = Math.floor(remainder / 100);
  if (hundreds > 0) {
    letters += HUNDREDS[hundreds];
    remainder %= 100;
  }

  if (remainder === 15) {
    letters += "טו";
    remainder = 0;
  } else if (remainder === 16) {
    letters += "טז";
    remainder = 0;
  }

  const tens = Math.floor(remainder / 10);
  if (tens > 0) {
    letters += TENS[tens];
    remainder %= 10;
  }

  if (remainder > 0) {
    letters += ONES[remainder];
  }

  return `${result}${formatHebrewLetters(letters)}`;
};

export const formatDateWithHebrew = (value) => {
  if (!value) {
    return "ללא תאריך";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "ללא תאריך";
  }
  const gregorian = GREGORIAN_FORMATTER.format(date);
  const hebrewParts = HEBREW_FORMATTER.formatToParts(date);
  const day = hebrewParts.find((part) => part.type === "day")?.value ?? "";
  const month = hebrewParts.find((part) => part.type === "month")?.value ?? "";
  const year = hebrewParts.find((part) => part.type === "year")?.value ?? "";
  const hebrewDay = numberToHebrewLetters(day);
  const hebrewYear = numberToHebrewLetters(year);
  const hebrew = `${hebrewDay} ${month} ${hebrewYear}`.trim();
  return `${gregorian} · ${hebrew}`;
};
