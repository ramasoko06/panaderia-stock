// fixFecha.js
const pool = require('./db');

async function fixFecha() {
  try {
    // Modificar retiros_stock
    await pool.query(`
      ALTER TABLE retiros_stock
      MODIFY fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    // Modificar ingresos_stock
    await pool.query(`
      ALTER TABLE ingresos_stock
      MODIFY fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);

    console.log('Columnas fecha actualizadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al modificar columnas fecha:', error);
    process.exit(1);
  }
}

fixFecha();