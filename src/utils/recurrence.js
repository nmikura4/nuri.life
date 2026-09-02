/**
 * Utility functions for recurring tasks and calendar date checks.
 */

/**
 * Checks whether a given task occurs on a specific target date string (YYYY-MM-DD).
 * Handles daily, weekly, monthly, and yearly recurrences with optional recurrenceEndDate.
 *
 * @param {Object} task - Task object with deadline, recurrence, and recurrenceEndDate.
 * @param {string} targetDateStr - Target date in YYYY-MM-DD format.
 * @returns {boolean} True if the task is scheduled on targetDateStr.
 */
export const isTaskOnDate = (task, targetDateStr) => {
  if (!task || !task.deadline || !targetDateStr) return false;

  // Direct deadline match
  if (task.deadline === targetDateStr) return true;

  // No recurrence configured
  if (!task.recurrence || task.recurrence === 'none') return false;

  // Recurring tasks do not appear before their initial deadline date
  if (targetDateStr < task.deadline) return false;

  // If a recurrence end date is specified, the task does not appear after it
  if (task.recurrenceEndDate && targetDateStr > task.recurrenceEndDate) return false;

  const [tY, tM, tD] = task.deadline.split('-').map(Number);
  const [cY, cM, cD] = targetDateStr.split('-').map(Number);

  const taskDate = new Date(tY, tM - 1, tD);
  const targetDate = new Date(cY, cM - 1, cD);

  switch (task.recurrence) {
    case 'daily':
      return true;

    case 'weekly':
      return taskDate.getDay() === targetDate.getDay();

    case 'monthly':
      // Matches same day of the month (e.g. the 15th of every month)
      if (taskDate.getDate() === targetDate.getDate()) return true;
      // Handle edge cases where target month has fewer days than initial task date (e.g. 31st on Feb/Apr)
      const lastDayOfTargetMonth = new Date(cY, cM, 0).getDate();
      if (tD > lastDayOfTargetMonth && cD === lastDayOfTargetMonth) return true;
      return false;

    case 'yearly':
      return taskDate.getMonth() === targetDate.getMonth() && taskDate.getDate() === targetDate.getDate();

    default:
      return false;
  }
};

/**
 * Calculates next recurrence date after currentDeadlineStr.
 *
 * @param {string} currentDeadlineStr - Current deadline in YYYY-MM-DD format.
 * @param {string} recurrence - Recurrence rule: 'daily', 'weekly', 'monthly', 'yearly'.
 * @returns {string|null} Next deadline string in YYYY-MM-DD format, or null.
 */
export const calculateNextDeadline = (currentDeadlineStr, recurrence) => {
  if (!currentDeadlineStr || !recurrence || recurrence === 'none') return null;
  const [y, m, d] = currentDeadlineStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return null;

  if (recurrence === 'daily') {
    date.setDate(date.getDate() + 1);
  } else if (recurrence === 'weekly') {
    date.setDate(date.getDate() + 7);
  } else if (recurrence === 'monthly') {
    date.setMonth(date.getMonth() + 1);
  } else if (recurrence === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
  } else {
    return null;
  }

  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
};

/**
 * Formats a YYYY-MM-DD string or Date object into "11 Jun 2026" / "2 Sep 2026" format.
 *
 * @param {string|Date} dateInput - YYYY-MM-DD date string or Date object.
 * @returns {string} Formatted date string (e.g. "11 Jun 2026").
 */
export const formatDisplayDate = (dateInput) => {
  if (!dateInput) return '';
  let d;
  if (typeof dateInput === 'string') {
    if (dateInput.includes('-')) {
      const [y, m, day] = dateInput.split('T')[0].split('-').map(Number);
      d = new Date(y, m - 1, day);
    } else {
      d = new Date(dateInput);
    }
  } else if (dateInput instanceof Date) {
    d = dateInput;
  } else {
    return '';
  }

  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
