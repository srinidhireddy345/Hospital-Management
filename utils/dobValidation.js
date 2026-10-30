/**
 * Centralized Date of Birth (DOB) Validation Utility
 *
 * Rules:
 * 1. DOB must always be a date in the past.
 * 2. Today's date is NOT allowed.
 * 3. Future dates are NOT allowed.
 * 4. Future years are NOT allowed.
 * 5. Maximum allowed DOB is yesterday (computed dynamically every day).
 * 6. Error message: "Date of Birth must be a past date."
 */

export const DOB_ERROR_MESSAGE = "Date of Birth must be a past date.";

/**
 * Returns yesterday's date formatted as YYYY-MM-DD based on the current local date.
 * Automatically changes every day without hardcoding.
 */
export const getYesterdayDateString = () => {
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, "0");
  const day = String(yesterday.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Validates whether a given date string represents a valid date strictly in the past (yesterday or earlier).
 *
 * @param {string} dateStr - Date string in YYYY-MM-DD, DD-MM-YYYY, or standard parseable format.
 * @returns {boolean} True if strictly in the past, false if today, future, or invalid.
 */
export const isPastDOB = (dateStr) => {
  if (!dateStr || typeof dateStr !== "string") return false;
  const trimmed = dateStr.trim();
  if (!trimmed) return false;

  let year, month, day;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parts = trimmed.split("-").map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const parts = trimmed.split("-").map(Number);
    day = parts[0];
    month = parts[1];
    year = parts[2];
  } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    const parts = trimmed.split("/").map(Number);
    year = parts[0];
    month = parts[1];
    day = parts[2];
  } else {
    const parsed = new Date(trimmed);
    if (isNaN(parsed.getTime())) return false;
    year = parsed.getFullYear();
    month = parsed.getMonth() + 1;
    day = parsed.getDate();
  }

  // Basic numeric range validation
  if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31 || year < 1900) {
    return false;
  }

  // Check valid calendar day (e.g., Feb 30 does not roll over)
  const candidate = new Date(year, month - 1, day);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  ) {
    return false;
  }

  // Get current date at midnight (00:00:00.000)
  const now = new Date();
  const todayAtMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const candidateAtMidnight = new Date(year, month - 1, day, 0, 0, 0, 0);

  // Must be strictly less than today (i.e. yesterday or earlier)
  return candidateAtMidnight.getTime() < todayAtMidnight.getTime();
};

/**
 * Validates a DOB value and returns an object with validation result and exact error message.
 *
 * @param {string} dobString - The date of birth input string.
 * @param {boolean} [isRequired=true] - Whether an empty value is considered an error.
 * @returns {{ isValid: boolean, error: string }}
 */
export const validateDOB = (dobString, isRequired = true) => {
  if (!dobString || !dobString.trim()) {
    return {
      isValid: !isRequired,
      error: isRequired ? DOB_ERROR_MESSAGE : ""
    };
  }

  if (!isPastDOB(dobString)) {
    return {
      isValid: false,
      error: DOB_ERROR_MESSAGE
    };
  }

  return {
    isValid: true,
    error: ""
  };
};
