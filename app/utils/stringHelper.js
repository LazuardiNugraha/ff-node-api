const _ = require('lodash');

async function toCamelCaseKeys(obj) {
  if (Array.isArray(obj)) {
    return Promise.all(obj.map(toCamelCaseKeys));
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      const camelCaseKey = _.camelCase(key);
      return [camelCaseKey, value];
    })
  );
}

async function parseCamelJsonColumn(json) {
  try {
    return await toCamelCaseKeys(JSON.parse(json || '{}'));
  } catch (error) {
    return {};
  }
}

module.exports = {
  toCamelCaseKeys,
  parseCamelJsonColumn
};