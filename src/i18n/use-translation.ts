import { useCallback } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { dictionaries } from "./dictionaries";
import type { Dictionary } from "./types";

// Extract all valid dot-notation paths from the Dictionary type
type PathsToStringProps<T> = T extends string
  ? []
  : {
      [K in Extract<keyof T, string>]: [K, ...PathsToStringProps<T[K]>];
    }[Extract<keyof T, string>];

type Join<T extends string[], D extends string> = T extends []
  ? never
  : T extends [infer F]
    ? F
    : T extends [infer F, ...infer R]
      ? F extends string
        ? `${F}${D}${Join<Extract<R, string[]>, D>}`
        : never
      : string;

export type TranslationKey = Join<PathsToStringProps<Dictionary>, ".">;

/**
 * Returns a `t(key)` function that resolves typed translation keys
 * for the active language. Falls back to the key string if not found.
 */
export function useTranslation() {
  const language = useSettingsStore((state) => state.settings.language);
  const dictionary = dictionaries[language];

  const t = useCallback(
    (key: TranslationKey): string => {
      const keys = key.split(".");
      let current: unknown = dictionary;

      for (const k of keys) {
        if (typeof current === "object" && current !== null && k in current) {
          current = (current as Record<string, unknown>)[k];
        } else {
          console.warn(`Translation missing for key: ${key}`);
          return key;
        }
      }

      return typeof current === "string" ? current : key;
    },
    [dictionary],
  );

  return { t, language };
}
