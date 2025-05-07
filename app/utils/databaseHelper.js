const _ = require('lodash');

function generatePaginationLinks (baseUrl, page, limit, totalPages) {
  return {
    // first: `${baseUrl}?page=1&limit=${limit}`,
    // last: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
    // last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
  };
};

function isPrefixed(key, prefixes) {
  /**
   * Cek apakah field mengandung prefix dari relasi tertentu
   */

  return prefixes.some((prefix) => key.startsWith(prefix + '_') || key.startsWith(prefix));
}

async function transformJoinedRow(row, mainKey, relations = {}) {
  /**
   * Mengubah baris hasil join menjadi objek nested berdasarkan prefix.
   *
   * @param {Object} row - Row hasil query SQL (flat object).
   * @param {String} mainKey - Key utama (contoh: 'products').
   * @param {Object} relations - Key relasi dan field-fieldnya, contoh: { lockerSize: ['id', 'name', 'created_at'] }
   * @returns {Object} - Object nested hasil transformasi.
   */

  const result = {};

  // Ambil field dari table utama
  for (const key in row) {
    if (!isPrefixed(key, Object.keys(relations))) {
      result[key] = row[key];
    }
  }

  // Proses relasi
  for (const [relationKey, fields] of Object.entries(relations)) {
    result[relationKey] = {};

    for (const field of fields) {
      const aliases = [
        `${relationKey}_${field}`, // snake_case alias
        `${relationKey}${_.upperFirst(_.camelCase(field))}`, // camelCase alias
      ];

      const actualKey = aliases.find((a) => row.hasOwnProperty(a));
      if (actualKey) {
        result[relationKey][field] = row[actualKey];
      }
    }
  }

  return result;
}

async function paginate (connection, baseQuery, countQuery, params = [], page = 1, perPage = 10, req = null) {
  /**
   * Helper untuk melakukan pagination ala Laravel di MySQL
   * @param {object} connection - koneksi MySQL (pool atau connection)
   * @param {string} baseQuery - query utama SELECT tanpa LIMIT
   * @param {string} countQuery - query COUNT total
   * @param {array} params - parameter untuk baseQuery (opsional)
   * @param {number} page - halaman saat ini
   * @param {number} perPage - jumlah item per halaman
   * @param {object} req - objek request dari Express (opsional)
   * @returns {Promise<{data: any[], pagination: object}>}
   */

  try {
    // Kalau menggunakan promise.all
    // const [data, totalResult] = await Promise.all([
    //   new Promise((resolve, reject) => {
    //     connection.query(paginatedQuery, paginatedParams, (error, results) => {
    //       if (error) return reject(error);
    //       resolve(results);
    //     });
    //   }),
    //   new Promise((resolve, reject) => {
    //     connection.query(countQuery, params, (error, results) => {
    //       if (error) return reject(error);
    //       resolve(results[0].total);
    //     });
    //   })
    // ]);

    const offset = (page - 1) * perPage;

    const [countResult] = await connection.promise().query(countQuery, params);
    const total = countResult[0].total || 0; // Ambil total dari hasil query COUNT
    const totalPages = Math.ceil(total / perPage);

    const paginatedQuery = `${baseQuery} LIMIT ? OFFSET ?`;
    const paginatedParams = [...params, perPage, offset];

    const [data] = await connection.promise().query(paginatedQuery, paginatedParams);

    let links = null;
    if (req) {
      const baseUrl = `${req.protocol}://${req.get('host')}/api${req.path}`;
      links = generatePaginationLinks(baseUrl, page, perPage, totalPages);
    }

    return {
      data,
      pagination: {
        total,
        count: perPage,
        current_page: page,
        total_pages: totalPages,
        links,
      },
    };
  } catch (error) {
    throw new Error('Database query failed: ' + error.message);
  }
};

async function extractByPrefix(obj, prefix) {
  const result = {};
  for (const key in obj) {
    if (key.startsWith(prefix + "_")) {
      const newKey = key.replace(prefix + "_", "");
      result[newKey] = obj[key];
    }
  }
  return result;
}

async function generateSelectAlias(tableName, aliasPrefix, fields) {
  return fields.map((field) => `${tableName}.${field} AS ${aliasPrefix}_${field}`).join(', ');
}

module.exports = {
  paginate,
  extractByPrefix,
  transformJoinedRow,
  generateSelectAlias
};
