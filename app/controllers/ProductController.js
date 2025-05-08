const { get } = require('lodash');
const connection = require('../config/database');
const { databaseHelper, dateHelper, stringHelper } = require('../utils'); // Import the helper functions from the utils file

module.exports = {
  async getAllProducts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.limit) || 10;

      const baseQuery = `
        SELECT
          products.*,
          products.id AS product_id,
          products.name AS product_name,
          products.storage AS product_storage,
          products.created_at AS product_created_at,
          products.updated_at AS product_updated_at,
          locker_sizes.*,
          locker_sizes.id AS locker_size_id,
          locker_sizes.name AS locker_size_name,
          locker_sizes.storage AS locker_sizes_storage,
          locker_sizes.created_at AS locker_size_created_at,
          locker_sizes.updated_at AS locker_size_updated_at
        FROM products
        LEFT JOIN locker_sizes ON products.locker_size_id = locker_sizes.id
      `;

      const countQuery = `
        SELECT COUNT(*) AS total
        FROM products
        LEFT JOIN locker_sizes ON products.locker_size_id = locker_sizes.id
      `;

      const { data, pagination } = await databaseHelper.paginate(connection, baseQuery, countQuery, [], page, perPage, req);

      const filteredResults = data.map((row) => {
        return {
          id: row.product_id,
          skuNumber: row.sku,
          name: row.product_name,
          status: row.status,
          phyiscalStatus: row.phyiscal_verified,
          tenantId: row.tenant_id,
          isCreator: row.isCreator,
          zone: row.product_storage,
          shelfLife: parseInt(row.shelf_life),
          minimalFulfillment: row.minimal_fulfillment,
          boxContain: row.boxContain,
          price: parseInt(row.price),
          image: row.image,
          resellerPrice: row.price_reseller,
          createdAt: dateHelper.formatIndonesianDate(row.product_created_at),
          updatedAt: dateHelper.formatIndonesianDate(row.product_updated_at),
          lockerSize: {
            id: row.locker_size_id,
            name: row.locker_size_name,
            nameId: row.name_id,
            storage: row.locker_sizes_storage,
            storageId: row.storage_id,
            createdAt: dateHelper.formatIndonesianDate(row.locker_size_created_at),
            updatedAt: dateHelper.formatIndonesianDate(row.locker_size_updated_at),
          },
        };
      });

      res.json({
        data: filteredResults,
        meta: {
          pagination,
        },
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const id = req.params.id;

      const lockerSizeFields = ['id', 'name', 'name_id', 'storage', 'storage_id', 'created_at', 'updated_at'];
      const lockerSelect = await databaseHelper.generateSelectAlias('locker_sizes', 'lockerSize', lockerSizeFields);

      const results = await new Promise((resolve, reject) => {
        connection.query(
          `
            SELECT
              products.*,
              ${lockerSelect}
            FROM products
            LEFT JOIN locker_sizes ON products.locker_size_id = locker_sizes.id
            WHERE products.id = ?
          `,
          [id],
          (error, results) => {
            if (error) return reject(error);
            resolve(results);
          }
        );
      });

      const row = results[0];
      if (!row) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const formattedRow = await databaseHelper.transformJoinedRow(row,
        'products', { lockerSize: lockerSizeFields }
      );

      const formattedResult = await stringHelper.toCamelCaseKeys(formattedRow);
      formattedResult.barcode = await stringHelper.parseCamelJsonColumn(row.barcode);
      formattedResult.barcodeBox = await stringHelper.parseCamelJsonColumn(row.barcode_box);
      formattedResult.lockerSize = await stringHelper.toCamelCaseKeys(formattedResult.lockerSize);

      formattedResult.createdAt = dateHelper.formatIndonesianDate(formattedResult.createdAt);
      formattedResult.updatedAt = dateHelper.formatIndonesianDate(formattedResult.updatedAt);
      formattedResult.lockerSize.createdAt = dateHelper.formatIndonesianDate(formattedResult.lockerSize.createdAt);
      formattedResult.lockerSize.updatedAt = dateHelper.formatIndonesianDate(formattedResult.lockerSize.updatedAt);

      res.json({ data: formattedResult });
    } catch (error) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: error.message });
    }
  }
}