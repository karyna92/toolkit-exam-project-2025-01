const cron = require('node-cron');
const backupLogs = require('./backupLogs');
const { logError } = require('./errorLogger');

function scheduleDailyBackup(hour = 23, minute = 59) {
  const cronExpression = `${minute} ${hour} * * *`;

  cron.schedule(
    cronExpression,
    async () => {
      try {
        await backupLogs();
      } catch (err) {
        logError(err);
      }
    },
    {
      timezone: 'Europe/Kiev',
    }
  );
}

scheduleDailyBackup();

module.exports = scheduleDailyBackup;
