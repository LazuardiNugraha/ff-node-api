const _ = require('lodash');

async function toCamelCaseKeys(obj) {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const camelCaseKey = _.camelCase(key);
      return [camelCaseKey, value];
    })
  );
}

module.exports = {
  toCamelCaseKeys,
};