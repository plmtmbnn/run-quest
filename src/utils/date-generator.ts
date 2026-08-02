/**
 * Generate a random date of birth within a realistic age range (18-65 years old)
 * @returns ISO date string (YYYY-MM-DD)
 */
export function generateRandomDOB(): string {
  const today = new Date();
  const minAge = 18;
  const maxAge = 65;
  const ageRange = maxAge - minAge;

  // Generate random age within range
  const randomAge = Math.floor(Math.random() * ageRange) + minAge;
  const birthYear = today.getFullYear() - randomAge;

  // Generate random month (1-12)
  const birthMonth = Math.floor(Math.random() * 12) + 1;

  // Get correct days in that month
  const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
  const birthDay = Math.floor(Math.random() * daysInMonth) + 1;

  // Format as YYYY-MM-DD
  return `${birthYear}-${String(birthMonth).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
}

/**
 * Generate a default date of birth for 18 years old
 * @returns ISO date string (YYYY-MM-DD)
 */
export function generateDefaultDOB(): string {
  const today = new Date();
  const defaultAge = 18;
  const birthYear = today.getFullYear() - defaultAge;

  // Use January 1st as default
  return `${birthYear}-01-01`;
}
