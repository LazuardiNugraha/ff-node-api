// const { raw } = require('mysql2');
const { format } = require('mysql2');
const connection = require('../config/database');
// const { update } = require('lodash');

const paginate = require('../utils/databaseHelper').paginate; // Import the paginate function from the helper file
const toCamelCaseKeys = require('../utils/stringHelper').toCamelCaseKeys; // Import the toCamelCaseKeys function from the helper file
const formatIndonesianDate = require('../utils/dateHelper').formatIndonesianDate; // Import the formatIndonesianDate function from the helper file

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

      const { data, pagination } = await paginate(connection, baseQuery, countQuery, [], page, perPage, req);

      const filteredResults = await Promise.all(data.map(async (row) => {
        const formattedDetail = await toCamelCaseKeys(JSON.parse(row.detail || '{}'));
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
          allocatedAt: formatIndonesianDate(row.allocated_at),
          isCanceled: row.isCanceled,
          lastStatus: row.last_status,
          camsStatus: row.cams_status,
          lastTry: formatIndonesianDate(row.last_try),
          firstReason: row.first_reason,
          reason: row.reason,
          retry: row.retry,
          detail: formattedDetail,
          product: rawProduct,
          createdBy: row.created_by,
          createdAt: formatIndonesianDate(row.created_at),
          updatedBy: row.updated_by,
          updatedAt: formatIndonesianDate(row.updated_at),
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
};
