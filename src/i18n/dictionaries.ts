import en from "../content/translations/en.json";
import id from "../content/translations/id.json";
import type { Dictionary, Language } from "./types";

export const dictionaries: Record<Language, Dictionary> = {
  en: en as Dictionary,
  id: id as Dictionary,
};
