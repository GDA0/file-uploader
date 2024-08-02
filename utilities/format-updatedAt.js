const { format, isToday, isYesterday, differenceInYears } = require("date-fns");

function formatUpdatedAt(dateString) {
  const date = new Date(dateString);
  const now = new Date();

  if (isToday(date)) {
    return format(date, "h:mm a"); // Only time for today
  } else if (isYesterday(date)) {
    return `Yesterday at ${format(date, "h:mm a")}`; // Special case for yesterday
  } else if (differenceInYears(now, date) < 1) {
    return format(date, "MMM d [at] h:mm a"); // Date without year for this year
  } else {
    return format(date, "MMM d, yyyy [at] h:mm a"); // Full date for older dates
  }
}

module.exports = formatUpdatedAt;
