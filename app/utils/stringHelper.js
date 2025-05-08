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
    const parsed = JSON.parse(json || '[]');

    // Jika hasilnya array of primitive (string/number/etc), langsung return
    if (Array.isArray(parsed) && parsed.every((item) => typeof item !== 'object' || item === null)) {
      return parsed;
    }

    return await toCamelCaseKeys(parsed);
  } catch (error) {
    return [];
  }
}

function pickAndRename(source, mapping) {
  if (!source || typeof source !== 'object') return {};

  const result = {};
  for (const [targetKey, sourceKey] of Object.entries(mapping)) {
    result[targetKey] = source[sourceKey];
  }

  return result;
}

async function formatRelatedUser(rawUser) {
  /**
   * Format object relasi user (misal: pic, creator, approver)
   * - Menggabungkan firstName + lastName menjadi name
   * - Menghapus firstName dan lastName
   * - Menjadikan null jika semua field null
   * @param {Object} rawUser
   * @returns {Object|null}
   */

  if (!rawUser) return null;

  // const user = await toCamelCaseKeys(rawUser);
  const { firstName, lastName, ...rest } = rawUser;

  const name = [firstName || '', lastName || ''].join(' ').trim();

  const cleanedUser = {
    ...rest,
    ...(name ? { name } : {}),
  };

  return cleanedUser;
}

module.exports = {
  toCamelCaseKeys,
  parseCamelJsonColumn,
  pickAndRename,
  formatRelatedUser
};