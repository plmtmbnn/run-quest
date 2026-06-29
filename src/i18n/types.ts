export type Language = "en" | "id";

export interface Dictionary {
  common: {
    start: string;
    cancel: string;
    save: string;
    loading: string;
    continue: string;
  };
  home: {
    title: string;
    subtitle: string;
  };
  language: {
    title: string;
    subtitle: string;
    english: string;
    indonesian: string;
  };
}
