const backupLogs = require('./src/services/backupLogs');

function scheduleDailyBackup(hour = 23, minute = 59) {
  const now = new Date();
  let next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  const delay = next - now;

  setTimeout(() => {
    backupLogs().catch(console.error);
    setInterval(() => backupLogs().catch(console.error), 24 * 60 * 60 * 1000);
  }, delay);
}

scheduleDailyBackup();
