const db = require('../db');

const Ingreso = {

  // ==========================
  // CREAR INGRESO
  // ==========================
  crear: async ({ producto_id, cantidad, fecha }) => {
    const sql = `
      INSERT INTO ingresos_stock
      (producto_id, cantidad, fecha)
      VALUES (?, ?, ?)
    `;
    await db.query(sql, [producto_id, cantidad, fecha]);
  },

  // ==========================
  // OBTENER TODOS (SIN FILTRO)
  // ==========================
  obtenerTodos: async () => {
    const sql = `
      SELECT 
        i.id,
        p.nombre,
        p.categoria,
        i.cantidad,
        i.fecha
      FROM ingresos_stock i
      INNER JOIN productos p ON i.producto_id = p.id
      ORDER BY i.fecha DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // ==========================
  // OBTENER CON BUSQUEDA (NOMBRE / CATEGORIA)
  // ==========================
  obtenerConBusqueda: async (busqueda) => {
    const sql = `
      SELECT 
        i.id,
        p.nombre,
        p.categoria,
        i.cantidad,
        i.fecha
      FROM ingresos_stock i
      INNER JOIN productos p ON i.producto_id = p.id
      WHERE 
        p.nombre LIKE ?
        OR p.categoria LIKE ?
      ORDER BY i.fecha DESC
    `;

    const like = `%${busqueda}%`;
    const [rows] = await db.query(sql, [like, like]);
    return rows;
  }

};

module.exports = Ingreso;