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
    days: string;
    back: string;
    level: string;
    balance: string;
    reduction: string;
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
      wins: string;
      rating: string;
      reputation: string;
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
    todays_training: string;
    training_completed: string;
    training_scheduled: string;
    view_training_plan: string;
    coach_tip: string;
    player_id: string;
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
      stability?: ChoiceText;
      max_cushion?: ChoiceText;
      aggressive_trail?: ChoiceText;
      minimalist_trail?: ChoiceText;
    };
    nutrition: {
      title: string;
      hot_weather_tip?: string;
      cold_weather_tip?: string;
      water: ChoiceText;
      electrolyte: ChoiceText;
      energy_gel: ChoiceText;
      caffeine: ChoiceText;
      energy_bar?: ChoiceText;
      hydration_mix?: ChoiceText;
      salt_tablets?: ChoiceText;
      caffeine_gum?: ChoiceText;
    };
    gear: {
      title: string;
      hot_weather_tip?: string;
      cold_weather_tip?: string;
      rainy_weather_tip?: string;
      cap: ChoiceText;
      sunglasses: ChoiceText;
      arm_sleeves: ChoiceText;
      hydration_vest: ChoiceText;
      lightweight_jacket?: ChoiceText;
      compression_socks?: ChoiceText;
      trail_gaiters?: ChoiceText;
      moisture_wicking_shirt?: ChoiceText;
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
      music_on?: string;
      music_off?: string;
      music?: {
        phase_start?: string;
        phase_mid_race?: string;
        phase_final_kick?: string;
        phase_victory?: string;
        phase_mid?: string;
        phase_final?: string;
        phase_crisis?: string;
        phase_finish?: string;
      };
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
    feedback: {
      overtraining_risk: string;
      no_rest_days: string;
      back_to_back_hard_days: string;
      high_fatigue: string;
      good_spacing: string;
      good_balance: string;
      add_second_session: string;
      more_volume: string;
      great_race_recovery: string;
      taper_week: string;
      solid_plan: string;
      decent_plan: string;
    };
  };
  onboarding: {
    header: string;
    next: string;
    start: string;
    name_error: string;
    view_guide: string;
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
    slide_5: {
      title: string;
      subtitle: string;
      content: string;
    };
  };
  how_to_play: {
    title: string;
    subtitle: string;
    back: string;
    pro_tip_title: string;
    pro_tip_desc: string;
    sections: {
      scheduling: {
        title: string;
        desc: string;
        item1: string;
        item2: string;
        item3: string;
      };
      economy: {
        title: string;
        desc: string;
        item1: string;
        item2: string;
        item3: string;
      };
      shop: {
        title: string;
        desc: string;
        item1: string;
        item2: string;
        item3: string;
      };
      training: {
        title: string;
        desc: string;
        item1: string;
        item2: string;
        item3: string;
      };
      race_day: {
        title: string;
        desc: string;
        item1: string;
        item2: string;
        item3: string;
      };
      progression: {
        title: string;
        desc: string;
        item1: string;
        item2: string;
        item3: string;
      };
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
    dob?: {
      desc: string;
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
    currency: {
      title: string;
      desc: string;
      trigger_label: string;
      listbox_label: string;
      example: string;
      select: string;
      backdrop: string;
      search: string;
      no_results: string;
    };
    sync: {
      title: string;
      desc: string;
    };
  };
  economy: {
    page_title: string;
    ledger_title: string;
    active_job: string;
    perform_work: string;
    apply_job: string;
    wait_days: string;
    pay_rate: string;
    energy_cost: string;
    current_energy: string;
    already_worked_today: string;
    low_energy_warning: string;
    balance_label: string;
    net_change: string;
    total_earned: string;
    total_spent: string;
    race_entry_costs: string;
    prize_earnings: string;
    earnings_breakdown: string;
    race_prizes: string;
    work: string;
    sponsors: string;
    other: string;
    recent_transactions: string;
    no_transactions: string;
    category_label: string;
  };
  race_tiers: {
    local: string;
    regional: string;
    state: string;
    national: string;
    international: string;
    beginner: string;
    intermediate: string;
    advanced: string;
    elite: string;
    legendary: string;
  };
  work: {
    title: string;
    subtitle: string;
    est_pay: string;
    current_energy: string;
    select_to_apply: string;
    cooldown: string;
    effects: {
      health: string;
      intellect: string;
      charisma: string;
    };
    cancel: string;
    apply_job: string;
    outcome: {
      accepted: string;
      rejected: string;
    };
    types: Record<string, { name: string; desc: string }>;
    missing_req: {
      age_min: string;
      age_max: string;
      intellect: string;
      charisma: string;
      running_skill: string;
      sponsor: string;
      career_wins: string;
    };
  };
  rest: {
    day_label: string;
    week_label: string;
    halted_race: string;
  };
  game: {
    date_full_format: string;
    age_label: string;
    energy_level: string;
  };
  nav: {
    shop: string;
    home: string;
    profile: string;
    social: string;
    economy: string;
    how_to_play?: string;
  };
  race?: {
    analytics: {
      deep_dive: string;
      deep_dive_desc: string;
      collapse: string;
      title: string;
      pace_chart: string;
      energy_curve: string;
      position_progression: string;
      fatigue_split: string;
      critical_moments: string;
    };
    /** Sprint 34 – Task 5: Dynamic weather transition strings */
    weather?: {
      alert_title: string;
      transition_to: string;
      energy_up: string;
      energy_down: string;
      morale_up: string;
      morale_down: string;
      conditions_improved: string;
      energy_increased: string;
      conditions_stable: string;
    };
  };
  disclaimer?: {
    title: string;
    offline_info: string;
    unofficial_notice: string;
  };
  social?: {
    title: string;
    subtitle: string;
    tabs: {
      leaderboard: string;
      leaderboards: string;
      club: string;
      stats: string;
      head_to_head: string;
      feed: string;
    };
    scope: {
      regional: string;
      global: string;
      rivals: string;
      select_region: string;
      select_region_desc: string;
    };
    club: {
      title: string;
      subtitle: string;
      active_membership: string;
      weekly_goal: string;
      weekly_goal_desc: string;
      your_contribution: string;
      member_contributions: string;
      bonus_status: string;
      join_button: string;
    };
    stats: {
      percentile_rank: string;
      percentile_desc: string;
      league_rank: string;
      league_desc: string;
      performance_trend: string;
      trend_desc: string;
      win_streak: string;
      vs_last_run: string;
      personal_best: string;
      avg_last_5: string;
      rival_head_to_head: string;
      rival_desc: string;
      leading: string;
      trailing: string;
      tied: string;
      no_encounters: string;
      nemesis_title: string;
    };
    feed: {
      title: string;
      subtitle: string;
      today: string;
      days_ago: string;
    };
  };
  expenses: {
    title: string;
    day: string;
    summary: string;
    weekly_total: string;
    monthly_total: string;
    weekly_expenses: string;
    mandatory: string;
    optional: string;
    unlocked_at: string;
    enable: string;
    disable: string;
    manage: string;
    history: string;
    active_benefits: string;
    benefits_title: string;
    status_good: string;
    status_warning: string;
    status_critical: string;
    unpaid_warning: string;
    insufficient_funds: string;
    find_work: string;
    deducted: string;
    frequency: {
      daily: string;
      weekly: string;
      monthly: string;
    };
    benefits: {
      trainingEffectiveness: string;
      xpBonus: string;
      injuryRiskReduction: string;
      recoverySpeed: string;
      treatmentDiscount: string;
      staminaRecovery: string;
      nutritionEfficiency: string;
    };
    living_expenses: {
      name: string;
      description: string;
    };
    gym_membership: {
      name: string;
      description: string;
    };
    personal_coaching: {
      name: string;
      description: string;
    };
    health_insurance: {
      name: string;
      description: string;
    };
    sports_massage: {
      name: string;
      description: string;
    };
    nutritionist: {
      name: string;
      description: string;
    };
  };
  health?: {
    status?: string | { healthy: string; injured: string; recovering: string };
    healthy?: string;
    injured?: string;
    recovering?: string;
    overtrained?: string;
    overtrain_level?: string;
    fatigue_level?: string;
    performance?: string;
    active_injuries?: string;
    no_active_injuries?: string;
    injury_history?: string;
    no_injury_history?: string;
    treatment_options_for?: string;
    no_treatments_available?: string;
    view_treatments?: string;
    apply_treatment?: string;
    treatment_success?: string;
    treatment_failed?: string;
    instant_heal?: string;
    recovery_time?: string;
    success_rate?: string;
    take_rest_day?: string;
    cannot_train?: string;
    cannot_race?: string;
    view_details?: string;
    healed?: string;
    day?: string;
    insufficient_funds?: string;
    high_overtrain?: string;
    high_fatigue?: string;
    performance_impact?: string;
    reduction?: string;
    treatment_failed_try_again?: string;
    injury_instantly_healed?: string;
    treatment_applied?: string;
    critical?: string;
    major_injury?: string;
    moderate_injury?: string;
    minor_injury?: string;
    health_status?: string;
    medical_center?: string;
    overall_status?: string;
    overtrain_risk?: string;
    days_remaining?: string;
    severity_critical?: string;
    severity_major?: string;
    severity_moderate?: string;
    severity_minor?: string;
    injuries?: Record<string, string>;
    [key: string]: any;
  };
  tour?: {
    button: string;
    start: string;
    back: string;
    next: string;
    finish: string;
    step_progress: string;
    welcome: { title: string; content: string };
    clock: { title: string; content: string };
    health: { title: string; content: string };
    expenses: { title: string; content: string };
    training: { title: string; content: string };
    races: { title: string; content: string };
    rest: { title: string; content: string };
    screens?: {
      training?: {
        welcome?: { title: string; content: string };
        calendar?: { title: string; content: string };
        templates?: { title: string; content: string };
        coach?: { title: string; content: string };
      };
      preparation?: {
        welcome?: { title: string; content: string };
        shoes?: { title: string; content: string };
        nutrition?: { title: string; content: string };
        gear?: { title: string; content: string };
        warmup?: { title: string; content: string };
        pacing?: { title: string; content: string };
      };
      shop?: {
        welcome?: { title: string; content: string };
        categories?: { title: string; content: string };
        items?: { title: string; content: string };
      };
      result?: {
        welcome?: { title: string; content: string };
        summary?: { title: string; content: string };
        stats?: { title: string; content: string };
        share?: { title: string; content: string };
      };
      medical?: {
        welcome?: { title: string; content: string };
        status?: { title: string; content: string };
        treatments?: { title: string; content: string };
      };
      briefing?: {
        welcome?: { title: string; content: string };
        course?: { title: string; content: string };
        weather?: { title: string; content: string };
        start?: { title: string; content: string };
      };
      race?: {
        welcome?: { title: string; content: string };
        simulation?: { title: string; content: string };
        stats?: { title: string; content: string };
        decisions?: { title: string; content: string };
      };
    };
  };
  race_calendar?: Record<string, any>;
}
