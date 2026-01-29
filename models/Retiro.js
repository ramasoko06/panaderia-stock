const db = require('../db');

const Retiro = {

  // ==========================
  // REGISTRAR RETIRO
  // ==========================
  // comentario es OPCIONAL
  crear: async ({ producto_id, cantidad, motivo, comentario }) => {
    const sql = `
      INSERT INTO retiros_stock
      (producto_id, cantidad, motivo, comentario)
      VALUES (?, ?, ?, ?)
    `;

    await db.query(sql, [
      producto_id,
      cantidad,
      motivo,
      comentario && comentario.trim() !== ''
        ? comentario.trim()
        : null
    ]);
  },

  // ==========================
  // OBTENER RETIROS POR PRODUCTO
  // (para vista de detalle)
  // ==========================
  obtenerPorProducto: async (producto_id) => {
    const sql = `
      SELECT
        id,
        cantidad,
        motivo,
        comentario,
        fecha
      FROM retiros_stock
      WHERE producto_id = ?
      ORDER BY fecha DESC, id DESC
    `;

    const [rows] = await db.query(sql, [producto_id]);
    return rows;
  },

  // ==========================
  // OBTENER TODOS
  // ==========================
  obtenerTodos: async () => {
    const sql = `
      SELECT
        r.id,
        p.nombre,
        p.categoria,
        r.cantidad,
        r.motivo,
        r.comentario,
        r.fecha
      FROM retiros_stock r
      INNER JOIN productos p ON r.producto_id = p.id
      ORDER BY r.fecha DESC, r.id DESC
    `;

    const [rows] = await db.query(sql);
    return rows;
  },

  // ==========================
  // OBTENER CON BUSQUEDA
  // ==========================
  obtenerConBusqueda: async (busqueda) => {
    const sql = `
      SELECT
        r.id,
        p.nombre,
        p.categoria,
        r.cantidad,
        r.motivo,
        r.comentario,
        r.fecha
      FROM retiros_stock r
      INNER JOIN productos p ON r.producto_id = p.id
      WHERE
        p.nombre LIKE ?
        OR p.categoria LIKE ?
      ORDER BY r.fecha DESC, r.id DESC
    `;

    const like = `%${busqueda}%`;
    const [rows] = await db.query(sql, [like, like]);
    return rows;
  }

};

module.exports = Retiro;