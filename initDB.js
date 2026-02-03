// initDB.js
const pool = require('./db');

async function init() {
  try {
    // ----------------------
    // Tabla productos
    // ----------------------
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo_barra VARCHAR(50),
        nombre VARCHAR(100) NOT NULL,
        categoria VARCHAR(100),
        stock_actual INT NOT NULL,
        fecha_elaboracion DATE,
        fecha_ingreso DATE NOT NULL,
        vencimiento DATE,
        numero_remito VARCHAR(50) NOT NULL,
        unidad_medida VARCHAR(5) NOT NULL,
        stock_minimo INT NOT NULL
      ) ENGINE=InnoDB
    `);

    // ----------------------
    // Tabla ingresos_stock
    // ----------------------
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ingresos_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        fecha DATETIME NOT NULL,
        numero_remito VARCHAR(50),
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      ) ENGINE=InnoDB
    `);

    // ----------------------
    // Tabla retiros_stock
    // ----------------------
    await pool.query(`
      CREATE TABLE IF NOT EXISTS retiros_stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto_id INT NOT NULL,
        cantidad INT NOT NULL,
        motivo VARCHAR(50) NOT NULL,
        fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        comentario TEXT,
        FOREIGN KEY (producto_id) REFERENCES productos(id)
      ) ENGINE=InnoDB
    `);

    console.log('Tablas creadas correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error creando tablas:', error);
    process.exit(1);
  }
}

init();