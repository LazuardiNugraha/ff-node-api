const { transform } = require('lodash');
const connection = require('../config/database');
const { databaseHelper, dateHelper, stringHelper } = require('../utils');

module.exports = {
  async getAllWarehouses(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.limit) || 10;

      const adminsFields = ['id', 'first_name', 'last_name', 'created_at', 'updated_at'];
      const adminSelect = await databaseHelper.generateSelectAlias('admins', 'pic', adminsFields);

      const physicalFields = ['id', 'name', 'code', 'created_at', 'updated_at'];
      const physicalSelect = await databaseHelper.generateSelectAlias('warehouseMaster', 'warehouseMaster', physicalFields);

      const baseQuery = `
        SELECT
         warehouses.*,
         ${physicalSelect},
         ${adminSelect}
        FROM warehouses
        LEFT JOIN warehouses AS warehouseMaster ON warehouses.physical_warehouse = warehouseMaster.id
        LEFT JOIN admins ON warehouses.warehouse_pic = admins.id
      `;

      const countQuery = `
        SELECT COUNT(*) AS total
        FROM warehouses
        LEFT JOIN admins ON warehouses.warehouse_pic = admins.id
        LEFT JOIN warehouses AS warehouseMaster ON warehouses.physical_warehouse = warehouseMaster.id
      `;

      const { data, pagination } = await databaseHelper.paginate(connection, baseQuery, countQuery, [], page, perPage, req);

      const filteredResults = await Promise.all(
        data.map(async (row) => {
          const transformedResults = await databaseHelper.transformJoinedRow(row, null, { pic: adminsFields, warehouseMaster: physicalFields });

          const formattedResults = {
            ...stringHelper.pickAndRename(transformedResults, {
              id: 'id',
              name: 'name',
              code: 'code',
              warehouseType: 'warehouse_type',
              warehouseClass: 'warehouse_class',
              subDistrict: 'subdistrict',
              district: 'district',
              city: 'city',
              province: 'province',
              postalCode: 'postal_code',
              warehouseLatitude: 'latitude',
              warehouseLongitude: 'longitude',
              createdAt: 'created_at',
              updatedAt: 'updated_at',
            }),
            pic: transformedResults.pic,
            warehouseMaster: transformedResults.warehouseMaster,
          };

          formattedResults.createdAt = dateHelper.formatIndonesianDate(formattedResults.createdAt);
          formattedResults.updatedAt = dateHelper.formatIndonesianDate(formattedResults.updatedAt);

          // format nama admin jika ada isinya
          if (formattedResults.pic != null) {
            formattedResults.pic = await stringHelper.toCamelCaseKeys(formattedResults.pic);
            const cleanedUser = formattedResults.pic = await stringHelper.formatRelatedUser(formattedResults.pic);

            const isEmpty = Object.values(cleanedUser).every((value) => value == null);
            formattedResults.pic = isEmpty
              ? null
              : {
                  id: cleanedUser.id,
                  name: cleanedUser.name,
                  createdAt: dateHelper.formatIndonesianDate(cleanedUser.createdAt),
                  updatedAt: dateHelper.formatIndonesianDate(cleanedUser.updatedAt),
                };
          }

          // format nama warehouse fisik jika ada isinya
          if (formattedResults.warehouseMaster != null) {
            formattedResults.warehouseMaster = await stringHelper.toCamelCaseKeys(formattedResults.warehouseMaster);
            const isEmpty = Object.values(formattedResults.warehouseMaster).every((value) => value == null);

            formattedResults.warehouseMaster.createdAt = dateHelper.formatIndonesianDate(formattedResults.warehouseMaster.createdAt);
            formattedResults.warehouseMaster.updatedAt = dateHelper.formatIndonesianDate(formattedResults.warehouseMaster.updatedAt);

            formattedResults.warehouseMaster = isEmpty ? null : formattedResults.warehouseMaster;
          }

          return formattedResults;
        })
      );

      res.json({
        data: filteredResults,
        meta: {
          pagination
        }
      });
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async getWarehouseById(req, res) {
    try {
      const id = req.params.id;

      const adminsFields = ['id', 'first_name', 'last_name', 'created_at', 'updated_at'];
      const adminSelect = await databaseHelper.generateSelectAlias('admins', 'warehousePic', adminsFields);

      const physicalFields = ['id', 'name', 'code', 'created_at', 'updated_at'];
      const physicalSelect = await databaseHelper.generateSelectAlias('physicalWarehouse', 'physicalWarehouse', physicalFields);

      const results = await new Promise((resolve, reject) => {
        connection.query(
          `
            SELECT
              warehouses.*,
              ${physicalSelect},
              ${adminSelect}
            FROM warehouses
            LEFT JOIN warehouses AS physicalWarehouse ON warehouses.physical_warehouse = physicalWarehouse.id
            LEFT JOIN admins ON warehouses.warehouse_pic = admins.id
            WHERE warehouses.id = ?
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
        return res.status(404).json({ error: 'Warehouse not found' });
      }

      const formattedRow = await databaseHelper.transformJoinedRow(row, 'warehouses', { warehousePic: adminsFields, physicalWarehouse: physicalFields });

      const formattedResult = await stringHelper.toCamelCaseKeys(formattedRow);
      formattedResult.createdAt = dateHelper.formatIndonesianDate(formattedResult.createdAt);
      formattedResult.updatedAt = dateHelper.formatIndonesianDate(formattedResult.updatedAt);

      formattedResult.sla = await stringHelper.parseCamelJsonColumn(row.sla);
      formattedResult.handoverMethod = await stringHelper.parseCamelJsonColumn(row.handover_method);

      // format response physical warehouse
      formattedResult.physicalWarehouse = await stringHelper.toCamelCaseKeys(formattedResult.physicalWarehouse);

      formattedResult.physicalWarehouse.createdAt = dateHelper.formatIndonesianDate(formattedResult.physicalWarehouse.createdAt);
      formattedResult.physicalWarehouse.updatedAt = dateHelper.formatIndonesianDate(formattedResult.physicalWarehouse.updatedAt);

      const isPhysicalEmpty = Object.values(formattedResult.physicalWarehouse).every((value) => value == null);
      formattedResult.physicalWarehouse = isPhysicalEmpty ? null : formattedResult.physicalWarehouse;

      // format response warehouse pic
      formattedResult.warehousePic = await stringHelper.toCamelCaseKeys(formattedResult.warehousePic);

      const isPicEmpty = Object.values(formattedResult.warehousePic).every((value) => value == null);

      if (!isPicEmpty) {
        const cleanedUser = (formattedResult.warehousePic = await stringHelper.formatRelatedUser(formattedResult.warehousePic));

        formattedResult.warehousePic = {
          id: cleanedUser.id,
          name: cleanedUser.name,
          createdAt: dateHelper.formatIndonesianDate(cleanedUser.createdAt),
          updatedAt: dateHelper.formatIndonesianDate(cleanedUser.updatedAt),
        };
      } else {
        formattedResult.warehousePic = null;
      }

      res.json({ data: formattedResult });
    } catch (error) {
      console.error('Error fetching warehouse:', error);
      res.status(500).json({ error: error.message });
    }
  }
}