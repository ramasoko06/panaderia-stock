const db = require('../db');

module.exports = {

  mostrarMovimientos: async (req, res) => {
    try {

      const {
        producto,
        categoria,
        motivo,
        fecha,
        fecha_desde,
        fecha_hasta,
        tipo
      } = req.query;

      let filtrosIngreso = [];
      let filtrosRetiro = [];

      let paramsIngreso = [];
      let paramsRetiro = [];

      // ==========================
      // FILTROS COMUNES
      // ==========================
      if (producto) {
        filtrosIngreso.push('p.nombre LIKE ?');
        filtrosRetiro.push('p.nombre LIKE ?');
        paramsIngreso.push(`%${producto}%`);
        paramsRetiro.push(`%${producto}%`);
      }

      if (categoria) {
        filtrosIngreso.push('p.categoria LIKE ?');
        filtrosRetiro.push('p.categoria LIKE ?');
        paramsIngreso.push(`%${categoria}%`);
        paramsRetiro.push(`%${categoria}%`);
      }

      if (fecha) {
        filtrosIngreso.push('DATE(i.fecha) = ?');
        filtrosRetiro.push('DATE(r.fecha) = ?');
        paramsIngreso.push(fecha);
        paramsRetiro.push(fecha);
      }

      if (fecha_desde && fecha_hasta) {
        filtrosIngreso.push('DATE(i.fecha) BETWEEN ? AND ?');
        filtrosRetiro.push('DATE(r.fecha) BETWEEN ? AND ?');
        paramsIngreso.push(fecha_desde, fecha_hasta);
        paramsRetiro.push(fecha_desde, fecha_hasta);
      } else if (fecha_desde) {
        filtrosIngreso.push('DATE(i.fecha) >= ?');
        filtrosRetiro.push('DATE(r.fecha) >= ?');
        paramsIngreso.push(fecha_desde);
        paramsRetiro.push(fecha_desde);
      } else if (fecha_hasta) {
        filtrosIngreso.push('DATE(i.fecha) <= ?');
        filtrosRetiro.push('DATE(r.fecha) <= ?');
        paramsIngreso.push(fecha_hasta);
        paramsRetiro.push(fecha_hasta);
      }

      // ==========================
      // INGRESOS
      // ==========================
      let sqlIngresos = `
        SELECT
          i.id AS id,
          p.nombre AS nombre,
          p.categoria AS categoria,
          i.cantidad AS cantidad,
          UPPER(p.unidad_medida) AS unidad,
          i.fecha AS fecha,
          'ingreso' AS tipo,
          NULL AS motivo,
          NULL AS comentario
        FROM ingresos_stock i
        INNER JOIN productos p ON p.id = i.producto_id
      `;

      if (filtrosIngreso.length) {
        sqlIngresos += ` WHERE ${filtrosIngreso.join(' AND ')}`;
      }

      // ==========================
      // EGRESOS
      // ==========================
      let sqlRetiros = `
        SELECT
          r.id AS id,
          p.nombre AS nombre,
          p.categoria AS categoria,
          r.cantidad AS cantidad,
          UPPER(p.unidad_medida) AS unidad,
          r.fecha AS fecha,
          'egreso' AS tipo,
          r.motivo AS motivo,
          r.comentario AS comentario
        FROM retiros_stock r
        INNER JOIN productos p ON p.id = r.producto_id
      `;

      if (motivo) {
        filtrosRetiro.push('r.motivo LIKE ?');
        paramsRetiro.push(`%${motivo}%`);
      }

      if (filtrosRetiro.length) {
        sqlRetiros += ` WHERE ${filtrosRetiro.join(' AND ')}`;
      }

      // ==========================
      // SQL FINAL SEGÚN TIPO
      // ==========================
      let finalSql;
      let params;

      if (tipo === 'ingreso') {
        finalSql = `
          ${sqlIngresos}
          ORDER BY fecha DESC, id DESC
        `;
        params = paramsIngreso;

      } else if (tipo === 'egreso') {
        finalSql = `
          ${sqlRetiros}
          ORDER BY fecha DESC, id DESC
        `;
        params = paramsRetiro;

      } else if (motivo) {
        finalSql = `
          ${sqlRetiros}
          ORDER BY fecha DESC, id DESC
        `;
        params = paramsRetiro;

      } else {
        finalSql = `
          ${sqlIngresos}
          UNION ALL
          ${sqlRetiros}
          ORDER BY fecha DESC, id DESC
        `;
        params = [...paramsIngreso, ...paramsRetiro];
      }

      const [movimientos] = await db.query(finalSql, params);

      res.render('movimientos', {
        movimientos,
        filtros: {
          producto: producto || '',
          categoria: categoria || '',
          motivo: motivo || '',
          fecha: fecha || '',
          fecha_desde: fecha_desde || '',
          fecha_hasta: fecha_hasta || '',
          tipo: tipo || ''
        }
      });

    } catch (error) {
      console.error('Error REAL:', error);
      res.status(500).send('Error al cargar movimientos');
    }
  }

};