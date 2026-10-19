import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "br", "es"],
  defaultLocale: "en",
  localePrefix: "always",
});
