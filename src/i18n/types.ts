export type Language = "en" | "id";

interface ChoiceText {
  name: string;
  desc: string;
}

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
  preparation: {
    title: string;
    subtitle: string;
    ready: string;
    shoes: {
      title: string;
      daily_trainer: ChoiceText;
      carbon_racer: ChoiceText;
      lightweight: ChoiceText;
      trail: ChoiceText;
    };
    nutrition: {
      title: string;
      water: ChoiceText;
      electrolyte: ChoiceText;
      energy_gel: ChoiceText;
      none: ChoiceText;
    };
    gear: {
      title: string;
      cap: ChoiceText;
      sunglasses: ChoiceText;
      arm_sleeves: ChoiceText;
      hydration_vest: ChoiceText;
    };
    warmup: {
      title: string;
      none: ChoiceText;
      dynamic: ChoiceText;
      full: ChoiceText;
    };
    pacing: {
      title: string;
      negative_split: ChoiceText;
      steady: ChoiceText;
      aggressive: ChoiceText;
      conservative: ChoiceText;
    };
    mindset: {
      title: string;
      calm: ChoiceText;
      confident: ChoiceText;
      fearless: ChoiceText;
    };
  };
}
