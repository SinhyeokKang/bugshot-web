import en from "./en.json";
import ko from "./ko.json";

export const messages = { en, ko } as const;

export type Locale = keyof typeof messages;
export type Messages = (typeof messages)[Locale];

export const defaultLocale: Locale = "en";
export const locales: Locale[] = ["en", "ko"];

export function getMessages(locale: Locale = defaultLocale): Messages {
  return messages[locale];
}
