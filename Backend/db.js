const mysql = require('mysql2'); 

// Configuracion de la conexion a MySql

const conexion = mysql.createConnection({
    host: 'localhost',         // Servidor local
    user: 'root',              // Usuario de MySql (Por defecto en XAMPP)
    database: 'tienda'         // Nombre de la base de datos
});

// Comprobacion se la conexion fue exitosa

conexion.connect((error => {
    if (error) {
        console.error("Error al conectar con MySql: ", error);
        return;
    }else {
        console.log("Conexión exitosa con MySql");
    }
})); 

// Es obligatorio exportar la conexion para reutilizarla en la srutas del servidor

module.exports = conexion;
