const fs = require('fs/promises');
const path = require('path');
const { getArchiveFileName } = require('../helpers/errorHelpers');
const { LOG_PATH, ARCHIVE_DIR } = require('../config/path');

async function backupLogs() {
  await fs.mkdir(ARCHIVE_DIR, { recursive: true });

  const data = await fs.readFile(LOG_PATH, 'utf-8');
  if (!data.trim()) return;

  const transformed = data
    .trim()
    .split('\n')
    .map((line) => {
      try {
        const parsed = JSON.parse(line);
        return {
          message: parsed.message,
          code: parsed.code || 500,
          time: parsed.time,
        };
      } catch (err) {
        console.error('Error parsing line for backup:', line);
        return null;
      }
    })
    .filter(Boolean);

  if (transformed.length === 0) return;

  const archivePath = path.join(ARCHIVE_DIR, getArchiveFileName());
  await fs.writeFile(archivePath, JSON.stringify(transformed, null, 2));

  await fs.writeFile(LOG_PATH, '');
  console.log('Logs backed up successfully:', archivePath);
}
module.exports = backupLogs;
