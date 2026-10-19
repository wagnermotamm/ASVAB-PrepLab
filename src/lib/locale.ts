export function dbLocale(locale: string) {
  if (locale === "br") return "pt-BR";
  if (locale === "es") return "es";
  return "en";
}

export function htmlLang(locale: string) {
  if (locale === "br") return "pt-BR";
  if (locale === "es") return "es";
  return "en";
}
