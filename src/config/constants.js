export const SITE_PASSWORD = 'cccedofeita';
export const ADMIN_USERNAME = 'Admin';
export const REHEARSAL_DAY = 2; // Tuesday (0 = Sunday, 1 = Monday, etc.)

// Attendance status values stored in the database.
// 'yes' is the original "Yes" and is shown as 20h (existing answers are never rewritten).
// 'yes_19' is the 19h arrival; they stay for 20h too, so both count as attending.
export const STATUS_20H = 'yes';
export const STATUS_19H = 'yes_19';
export const ATTENDING_STATUSES = [STATUS_20H, STATUS_19H];
