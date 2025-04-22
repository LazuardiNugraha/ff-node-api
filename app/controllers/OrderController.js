const connection = require('../config/database');
const paginate = require('../utils/databaseHelper').paginate; // Import the paginate function from the helper file

module.exports = {
  async getAllOrders(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.limit) || 10;

      const baseQuery = `
        SELECT
          orders.*,
          order_logistics.*,
          order_logistics.id AS logistic_id
        FROM orders
        LEFT JOIN order_logistics ON orders.order_id = order_logistics.order_id
      `

      const countQuery = `
        SELECT COUNT(*) AS total
        FROM orders
        LEFT JOIN order_logistics ON orders.order_id = order_logistics.order_id
      `

      const { data, pagination } = await paginate(connection, baseQuery, countQuery, [], page, perPage, req);

      const filteredResults = data.map((row) => {
        return {
          id: row.id,
          status: row.status,
          finalStatus: row.final_status,
          sla: row.sla,
          vipCustomer: row.vip_customer,
          orderId: row.order_id,
          tenantId: row.tenant_id,
          warehouseId: row.warehouse_id,
          consumableId: row.consumable_id,
          bookingId: row.booking_id,
          canceled_date: row.canceled_date,
          timeLimit: row.time_limit,
          statusHandover: row.status_handover,
          omniData: {
            pickedBy: row.picked_by,
            platform: row.platform,
            platformInvoiceId: row.platform_invoice_id,
            omniStatus: row.omni_status,
            omniCreatedAt: row.omni_created_at,
            omniCancelAt: row.omni_cancel_at,
            omniReturnAt: row.omni_return_at,
            transactionDeadline: row.transaction_deadline,
            omniCancelBy: row.omni_cancel_by,
          },
          logisticData: {
            id: row.logistic_id,
            logisticCompany: row.logistic_company,
            logisticService: row.logistic_service,
            logisticStatus: row.omni_logistic_status,
            waybillNo: row.waybill_no,
          }
        };
      });

      res.json({
        data: filteredResults,
        meta: {
          pagination
        },
      });

      // res.json({ data: filteredResults });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getOrderByOrderId(req, res) {
    try {
      const orderId = req.params.orderId;

      const results = await new Promise((resolve, reject) => {
        connection.query(
          'SELECT * FROM orders WHERE order_id = ?', [orderId], (error, results) => {
          if (error) return reject(error);
          resolve(results);
        });
      });

      res.json({ data: results })
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: error.message });
    }
  }
}