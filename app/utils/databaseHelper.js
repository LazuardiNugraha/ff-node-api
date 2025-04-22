function generatePaginationLinks (baseUrl, page, limit, totalPages) {
  return {
    // first: `${baseUrl}?page=1&limit=${limit}`,
    // last: page > 1 ? `${baseUrl}?page=${page - 1}&limit=${limit}` : null,
    next: page < totalPages ? `${baseUrl}?page=${page + 1}&limit=${limit}` : null,
    // last: `${baseUrl}?page=${totalPages}&limit=${limit}`,
  };
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

module.exports = {
  paginate,
};
