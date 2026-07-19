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
    player_profile: string;
    title: string;
    subtitle: string;
    completed: string;
    completed_subtitle: string;
    stats: {
      runs: string;
      streak: string;
      distance: string;
      money: string;
    };
    entry_tickets: string;
    remaining: string;
    recommended: string;
    runner_profile: string;
    daily_training: string;
    choose_race: string;
    resume_race: string;
    completed_badge: string;
    locked: string;
    target_time: string;
    next_race_in: string;
    countdown_desc: string;
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
      caffeine: ChoiceText;
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
  challenge: {
    weather: {
      sunny: string;
      cloudy: string;
      rain: string;
      storm: string;
      hot: string;
      cold: string;
      fog: string;
    };
    surface: {
      road: string;
      track: string;
      trail: string;
      any: string;
    };
    distance_types: {
      any: string;
      short: string;
      medium: string;
      long: string;
    };
    elevation: {
      flat: string;
      rolling: string;
      hilly: string;
    };
    briefing: {
      title: string;
      subtitle: string;
      distance: string;
      weather_temp: string;
      surface_type: string;
      elevation_profile: string;
      target_time: string;
      wind_speed: string;
      start_prep: string;
    };
    race: {
      running: string;
      finish: string;
      live_simulation: string;
      simulating: string;
      energy: string;
      hydration: string;
      focus: string;
      of_distance: string;
      feed: string;
      started_on: string;
      finished_rendering: string;
      engine_version: string;
      decision_title: string;
      remaining_seconds: string;
      strategic_choices: string;
      timeout: string;
      timeout_instinct: string;
    };
    result: {
      title: string;
      medal: string;
      grade: string;
      time: string;
      story_headline: string;
      lessons_learned: string;
      share: string;
      back_home: string;
      no_results_title: string;
      no_results_desc: string;
      go_home: string;
      score_out_of: string;
      share_card: string;
      download_png: string;
      generating_image: string;
      copied: string;
      outcome_gold: string;
      outcome_silver: string;
      outcome_bronze: string;
      outcome_finish: string;
      outcome_dnf: string;
      outcome_dns: string;
    };
  };
  share: {
    card_title: {
      loadout: string;
      result: string;
    };
    card_subtitle: {
      loadout: string;
      result: string;
    };
    card_footer: {
      loadout: string;
      dns: string;
      dnf: string;
      finished: string;
    };
    race_choice: {
      title: string;
      cta: string;
      button: string;
    };
    loadout: {
      title: string;
      cta: string;
      button: string;
    };
    coach: {
      title: string;
    };
    event: {
      title: string;
    };
    stats: {
      title: string;
      cta: string;
    };
    button: {
      copy_text: string;
      download: string;
      share: string;
    };
    copied: string;
    downloading: string;
    native_title: string;
  };
  analysis: {
    title: string;
    subtitle: string;
    key_recommendations: string;
    tactical_warnings: string;
    course_segments: string;
    weather_forecast: string;
    hazards_detected: string;
    distance: string;
    difficulty: string;
    segment_climb: string;
    segment_descent: string;
    segment_sprint: string;
    segment_flat: string;
  };
  training: {
    coach_feedback: string;
    no_feedback: string;
    choose_activity: string;
    quick_templates: string;
    recommended: string;
    selected: string;
    create_custom_plan: string;
    weekly_planner: string;
    plan_your_week: string;
    this_weeks_plan: string;
    adherence: string;
    weekly_stats: string;
    volume: string;
    energy_cost: string;
    hard_days: string;
    rest_days: string;
    plan_adherence: string;
    complete: string;
    missed: string;
    regenerate_plan: string;
    start_workout: string;
    need_energy: string;
    no_workout_today: string;
    days: {
      mon: string;
      tue: string;
      wed: string;
      thu: string;
      fri: string;
      sat: string;
      sun: string;
    };
    activities: {
      recovery_run: string;
      easy_run: string;
      tempo_run: string;
      interval_training: string;
      long_run: string;
      hill_repeats: string;
      strength_training: string;
      mobility_session: string;
      full_rest: string;
    };
  };
  onboarding: {
    header: string;
    next: string;
    start: string;
    name_error: string;
    slide_1: {
      title: string;
      subtitle: string;
      content: string;
    };
    slide_2: {
      title: string;
      subtitle: string;
      content: string;
    };
    slide_3: {
      title: string;
      subtitle: string;
      content: string;
    };
    slide_4: {
      title: string;
      subtitle: string;
      content: string;
    };
  };
  settings: {
    title: string;
    subtitle: string;
    sections: {
      general: string;
      race_preferences: string;
      danger_zone: string;
    };
    name: {
      title: string;
      desc: string;
      error: string;
    };
    sound: {
      title: string;
      desc: string;
    };
    language: {
      title: string;
      desc: string;
    };
    theme: {
      title: string;
      desc: string;
      light: string;
      dark: string;
      system: string;
    };
    preferences: {
      desc: string;
      surface: string;
      distance: string;
    };
    danger: {
      reset: string;
      desc: string;
      button: string;
      modal_title: string;
      modal_desc: string;
      cancel: string;
      confirm: string;
    };
  };
}
