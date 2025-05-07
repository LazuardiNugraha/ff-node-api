// app/utils/dateHelper.js

/**
 * Helper functions for datehelper utilities
 */

const dayjs = require('dayjs');

function formatIndonesianDate(str) {
  if (!str) return null;
  return dayjs(str).locale('id').format('DD MMMM YYYY - HH:mm:ss');
}

module.exports = {
  formatIndonesianDate,
};
