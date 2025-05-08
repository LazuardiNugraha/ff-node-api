const connection = require('../config/database');
const { databaseHelper, stringHelper, dateHelper } = require('../utils'); // Import the helper functions from the utils file

module.exports = {
  async getAllPendings(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.limit) || 10;

      const baseQuery = `
        SELECT
          pendings.*
        FROM pendings
      `;

      const countQuery = `
        SELECT COUNT(*) AS total
        FROM pendings
      `;

      const { data, pagination } = await databaseHelper.paginate(connection, baseQuery, countQuery, [], page, perPage, req);

      const filteredResults = await Promise.all(data.map(async (row) => {
        const formattedDetail = await stringHelper.toCamelCaseKeys(JSON.parse(row.detail || '{}'));
        const rawProduct = JSON.parse(row.product || '{}');

        return {
          id: row.id,
          status: row.status,
          tenantId: row.tenant_id,
          warehouseId: row.warehouse_id,
          bookingId: row.booking_id,
          sla: row.sla,
          vip: row.vip,
          priority: row.priority ?? row.isPriority,
          type: row.type,
          allocatedModel: row.allocated_model,
          allocatedId: row.allocated_id,
          allocatedAt: dateHelper.formatIndonesianDate(row.allocated_at),
          isCanceled: row.isCanceled,
          lastStatus: row.last_status,
          camsStatus: row.cams_status,
          lastTry: dateHelper.formatIndonesianDate(row.last_try),
          firstReason: row.first_reason,
          reason: row.reason,
          retry: row.retry,
          detail: formattedDetail,
          product: rawProduct,
          createdBy: row.created_by,
          createdAt: dateHelper.formatIndonesianDate(row.created_at),
          updatedBy: row.updated_by,
          updatedAt: dateHelper.formatIndonesianDate(row.updated_at),
        };
      }))

      res.json({
        data: filteredResults,
        meta: {
          pagination,
        },
      });
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getPendingByBookingId(req, res) {
    try {
      const bookingId = req.params.bookingId;

      const results = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT * FROM pendings WHERE booking_id = ?`, [bookingId], (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        )
      });

      const row = results[0];
      if (!row) {
        return res.status(404).json({ error: 'Pending not found' });
      }

      const formattedResult = await stringHelper.toCamelCaseKeys(row);

      formattedResult.detail = await stringHelper.parseCamelJsonColumn(row.detail);
      formattedResult.product = await stringHelper.toCamelCaseKeys(JSON.parse(row.product || '{}'));

      formattedResult.createdAt = dateHelper.formatIndonesianDate(formattedResult.createdAt);
      formattedResult.updatedAt = dateHelper.formatIndonesianDate(formattedResult.updatedAt);
      formattedResult.lastTry = dateHelper.formatIndonesianDate(formattedResult.lastTry);

      res.json({ data: formattedResult });
    } catch (error) {
      console.error('Error fetching pending:', error);
      res.status(500).json({ error: error.message });
    }
  }
};
