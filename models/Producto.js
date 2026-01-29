const db = require('../db');

const Producto = {

  crear: async ({
    codigo_barra,
    nombre,
    categoria,
    stock_actual,
    unidad_medida,
    fecha_elaboracion,
    fecha_ingreso,
    vencimiento,
    numero_remito,
    stock_minimo = 5
  }) => {

    const esCongelado = categoria?.toLowerCase() === 'congelados';
    const esInsumo = categoria?.toLowerCase() === 'insumos'; // 👈 NUEVO

    const sql = `
      INSERT INTO productos
      (
        codigo_barra,
        nombre,
        categoria,
        stock_actual,
        unidad_medida,
        fecha_elaboracion,
        fecha_ingreso,
        vencimiento,
        numero_remito,
        stock_minimo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(sql, [
      codigo_barra,
      nombre,
      categoria,
      stock_actual,
      unidad_medida,
      (esCongelado || esInsumo) ? null : fecha_elaboracion,
      fecha_ingreso,
      esCongelado ? null : (vencimiento || null),
      numero_remito,
      stock_minimo
    ]);

    return result.insertId;
  },

  obtenerTodos: async () => {
    const sql = `
      SELECT
        *,
        unidad_medida AS unidad
      FROM productos
      ORDER BY nombre
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  obtenerPorCodigoBarra: async (codigo_barra) => {
    const sql = `
      SELECT
        *,
        unidad_medida AS unidad
      FROM productos
      WHERE codigo_barra = ?
      LIMIT 1
    `;
    const [rows] = await db.query(sql, [codigo_barra]);
    return rows[0];
  },

  // ==========================
  // STOCK AGRUPADO (PRINCIPAL)
  // ==========================
  obtenerAgrupadosPorNombre: async () => {
    const sql = `
      SELECT 
        nombre,
        categoria,
        unidad_medida AS unidad,
        SUM(stock_actual) AS stock_total,
        MIN(stock_minimo) AS stock_minimo,

        MIN(
          CASE
            WHEN categoria NOT IN ('congelados', 'insumos') AND stock_actual > 0
            THEN vencimiento
            ELSE NULL
          END
        ) AS vencimiento,

        DATEDIFF(
          MIN(
            CASE
              WHEN categoria NOT IN ('congelados', 'insumos') AND stock_actual > 0
              THEN vencimiento
              ELSE NULL
            END
          ),
          CURDATE()
        ) AS dias_vencer,

        MAX(
          CASE
            WHEN categoria NOT IN ('congelados', 'insumos')
             AND stock_actual > 0
             AND fecha_elaboracion IS NOT NULL
             AND DATEDIFF(fecha_ingreso, fecha_elaboracion) >= 5
            THEN 1
            ELSE 0
          END
        ) AS fecha_corta

      FROM productos
      GROUP BY nombre, categoria, unidad_medida
      ORDER BY
        dias_vencer IS NULL,
        dias_vencer ASC
    `;

    const [rows] = await db.query(sql);
    return rows;
  },

  obtenerAgrupadosFiltrados: async (busqueda) => {
    const sql = `
      SELECT 
        nombre,
        categoria,
        unidad_medida AS unidad,
        SUM(stock_actual) AS stock_total,
        MIN(stock_minimo) AS stock_minimo,

        MIN(
          CASE
            WHEN categoria NOT IN ('congelados', 'insumos') AND stock_actual > 0
            THEN vencimiento
            ELSE NULL
          END
        ) AS vencimiento,

        DATEDIFF(
          MIN(
            CASE
              WHEN categoria NOT IN ('congelados', 'insumos') AND stock_actual > 0
              THEN vencimiento
              ELSE NULL
            END
          ),
          CURDATE()
        ) AS dias_vencer,

        MAX(
          CASE
            WHEN categoria NOT IN ('congelados', 'insumos')
             AND stock_actual > 0
             AND fecha_elaboracion IS NOT NULL
             AND DATEDIFF(fecha_ingreso, fecha_elaboracion) >= 5
            THEN 1
            ELSE 0
          END
        ) AS fecha_corta

      FROM productos
      WHERE nombre LIKE ? OR categoria LIKE ?
      GROUP BY nombre, categoria, unidad_medida
      ORDER BY
        dias_vencer IS NULL,
        dias_vencer ASC
    `;

    const like = `%${busqueda}%`;
    const [rows] = await db.query(sql, [like, like]);
    return rows;
  },

  // ==========================
  // LOTES POR PRODUCTO
  // ==========================
  obtenerPorNombre: async (nombre) => {
    const sql = `
      SELECT
        id,
        codigo_barra,
        stock_actual,
        unidad_medida AS unidad,
        fecha_elaboracion,
        fecha_ingreso,
        vencimiento,
        numero_remito,
        categoria,
        stock_minimo
      FROM productos
      WHERE nombre = ?
      ORDER BY
        CASE
          WHEN categoria IN ('congelados', 'insumos') THEN 1
          ELSE 0
        END,
        vencimiento
    `;
    const [rows] = await db.query(sql, [nombre]);
    return rows;
  },

  obtenerPorId: async (id) => {
    const sql = `
      SELECT
        *,
        unidad_medida AS unidad
      FROM productos
      WHERE id = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  descontarStock: async (id, cantidad) => {
    const sql = `
      UPDATE productos
      SET stock_actual = stock_actual - ?
      WHERE id = ?
        AND stock_actual >= ?
    `;
    const [result] = await db.query(sql, [cantidad, id, cantidad]);
    return result;
  },

  // ==========================
  // ACTUALIZAR STOCK MÍNIMO
  // ==========================
  actualizarStockMinimoPorNombre: async (nombre, stock_minimo) => {
    const sql = `
      UPDATE productos
      SET stock_minimo = ?
      WHERE nombre = ?
    `;
    await db.query(sql, [stock_minimo, nombre]);
  },

  eliminar: async (id) => {
    const sql = `
      DELETE FROM productos
      WHERE id = ?
    `;
    await db.query(sql, [id]);
  }
};

module.exports = Producto;