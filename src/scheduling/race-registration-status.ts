/**
 * Race Registration Status Engine
 * 
 * Determines the registration status and eligibility for race occurrences
 * with clear registration windows and proper validation
 */

import type { RaceOccurrence } from "./race-calendar-types";

export type RegistrationStatus =
  | 'completed'        // Race is finished
  | 'registered'       // Player is registered
  | 'available'        // Can register right now
  | 'too_early'        // Registration hasn't opened yet
  | 'too_late'         // Registration closed (too close to race)
  | 'today'            // Race is happening today
  | 'tomorrow'         // Race is tomorrow (prep day)
  | 'missed'           // Past race, not registered
  | 'full';            // Race is full

export interface RegistrationStatusInfo {
  status: RegistrationStatus;
  canRegister: boolean;
  daysUntilRace: number;
  daysUntilRegistrationOpens: number | null;
  daysUntilRegistrationCloses: number | null;
  message: string;
}

/**
 * Registration rules constants
 */
export const REGISTRATION_RULES = {
  /** Days before race that registration opens */
  REGISTRATION_OPENS_DAYS: 14,
  
  /** Days before race that registration closes (need prep day) */
  REGISTRATION_CLOSES_DAYS: 1,
  
  /** Maximum days in future to show races in calendar */
  CALENDAR_LOOKAHEAD_DAYS: 90,
  
  /** Days to show past races in history */
  CALENDAR_LOOKBACK_DAYS: 90,
};

/**
 * Get comprehensive registration status for a race occurrence
 * 
 * @param race - The race occurrence to check
 * @param currentDay - Current day index
 * @returns Detailed registration status information
 */
export function getRegistrationStatus(
  race: RaceOccurrence,
  currentDay: number
): RegistrationStatusInfo {
  const daysUntilRace = race.dayIndex - currentDay;
  
  // 1. Race is completed
  if (race.isCompleted) {
    return {
      status: 'completed',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
      message: 'Race completed',
    };
  }
  
  // 2. Already registered
  if (race.isRegistered) {
    return {
      status: 'registered',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
      message: 'Already registered',
    };
  }
  
  // 3. Race is full
  if (race.isFull) {
    return {
      status: 'full',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
      message: 'Race is full',
    };
  }
  
  // 4. Race is today
  if (daysUntilRace === 0) {
    return {
      status: 'today',
      canRegister: false,
      daysUntilRace: 0,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
      message: 'Race is today - too late to register',
    };
  }
  
  // 5. Race is tomorrow (prep day - too late)
  if (daysUntilRace === 1) {
    return {
      status: 'tomorrow',
      canRegister: false,
      daysUntilRace: 1,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: 0,
      message: 'Race is tomorrow - need preparation day',
    };
  }
  
  // 6. Past race (missed)
  if (daysUntilRace < 0) {
    return {
      status: 'missed',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: null,
      message: 'Race has passed',
    };
  }
  
  // Calculate registration window from race occurrence data
  // Use the registrationOpensAt and registrationClosesAt from the race
  const daysUntilOpen = race.registrationOpensAt - currentDay;
  const daysUntilClose = race.registrationClosesAt - currentDay;
  
  // 7. Too early - registration hasn't opened yet
  if (currentDay < race.registrationOpensAt) {
    return {
      status: 'too_early',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: daysUntilOpen,
      daysUntilRegistrationCloses: null,
      message: `Registration opens in ${daysUntilOpen} day${daysUntilOpen !== 1 ? 's' : ''}`,
    };
  }
  
  // 8. Too late - registration closed (within prep window)
  if (currentDay >= race.registrationClosesAt) {
    return {
      status: 'too_late',
      canRegister: false,
      daysUntilRace,
      daysUntilRegistrationOpens: null,
      daysUntilRegistrationCloses: 0,
      message: 'Registration closed - too close to race',
    };
  }
  
  // 9. Registration is open and available!
  return {
    status: 'available',
    canRegister: true,
    daysUntilRace,
    daysUntilRegistrationOpens: 0,
    daysUntilRegistrationCloses: daysUntilClose,
    message: `Registration open - ${daysUntilClose} day${daysUntilClose !== 1 ? 's' : ''} remaining`,
  };
}

/**
 * Check if a race can be registered for right now
 * 
 * @param race - The race occurrence
 * @param currentDay - Current day index
 * @returns true if registration is possible
 */
export function canRegisterForRace(
  race: RaceOccurrence,
  currentDay: number
): boolean {
  const status = getRegistrationStatus(race, currentDay);
  return status.canRegister;
}

/**
 * Get a user-friendly status label for display
 * 
 * @param race - The race occurrence
 * @param currentDay - Current day index
 * @returns Status label string
 */
export function getStatusLabel(
  race: RaceOccurrence,
  currentDay: number,
  t?: (key: any, vars?: Record<string, string | number>) => string
): { text: string; color: string; animated: boolean } {
  const info = getRegistrationStatus(race, currentDay);
  
  const getText = (key: string, defaultText: string, vars?: Record<string, string | number>) => {
    if (t) {
      return t(key, vars);
    }
    if (vars) {
      let str = defaultText;
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
      return str;
    }
    return defaultText;
  };
  
  switch (info.status) {
    case 'completed':
      return { text: getText('race_calendar.status.completed', 'Completed'), color: 'text-slate-500 dark:text-slate-400', animated: false };
    
    case 'registered':
      return { text: `${getText('race_calendar.status.registered', 'Registered')} ✓`, color: 'text-indigo-600 dark:text-indigo-400', animated: false };
    
    case 'available':
      return { text: getText('race_calendar.status.available', 'Registration Open'), color: 'text-emerald-600 dark:text-emerald-400', animated: true };
    
    case 'too_early':
      return { 
        text: info.daysUntilRegistrationOpens 
          ? getText('race_calendar.status.opens_in', 'Opens in {days}d', { days: info.daysUntilRegistrationOpens })
          : getText('race_calendar.status.coming_soon', 'Coming Soon'),
        color: 'text-blue-600 dark:text-blue-400',
        animated: false
      };
    
    case 'too_late':
    case 'tomorrow':
      return { text: getText('race_calendar.status.too_late', 'Registration Closed'), color: 'text-amber-600 dark:text-amber-400', animated: false };
    
    case 'today':
      return { text: getText('race_calendar.status.today', 'Today!'), color: 'text-purple-600 dark:text-purple-400', animated: true };
    
    case 'missed':
      return { text: getText('race_calendar.status.missed', 'Missed'), color: 'text-slate-500 dark:text-slate-400', animated: false };
    
    case 'full':
      return { text: getText('race_calendar.status.full', 'Full'), color: 'text-amber-600 dark:text-amber-400', animated: false };
    
    default:
      return { text: getText('race_calendar.status.upcoming', 'Upcoming'), color: 'text-slate-500 dark:text-slate-400', animated: false };
  }
}
