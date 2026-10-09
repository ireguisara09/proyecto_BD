const express = require("express");
const cors = require("cors");
const conexion = require("./db");

const app = express();
const PUERTO = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// GET: Obtener todos los productos
app.get("/producto", (req, res) => {
    const sql = "SELECT * FROM producto";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar productos:", error);
            return res.status(500).json({
                mensaje: "Error al consultar los productos"
            });
        }

        res.json(resultados);
    });
});

// POST: Registrar un producto
app.post("/producto", (req, res) => {
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({
            mensaje: "Debes completar todos los campos"
        });
    }

    const sql = `
        INSERT INTO producto (nombre, precio, stock)
        VALUES (?, ?, ?)
    `;

    const valores = [nombre, precio, stock];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al registrar producto:", error);
            return res.status(500).json({
                mensaje: "Error al registrar el producto"
            });
        }

        res.status(201).json({
            mensaje: "Producto registrado correctamente",
            id_producto: resultado.insertId
        });
    });
});

// PUT: Actualizar un producto por su ID
app.put("/producto/:id", (req, res) => {
    const id = req.params.id;
    const { nombre, precio, stock } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
        return res.status(400).json({
            mensaje: "Debes completar todos los campos"
        });
    }

    const sql = `
        UPDATE producto
        SET nombre = ?, precio = ?, stock = ?
        WHERE id_producto = ?
    `;

    const valores = [nombre, precio, stock, id];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al actualizar:", error);
            return res.status(500).json({
                mensaje: "Error al actualizar el producto"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se encontró el producto con ese ID"
            });
        }

        res.json({
            mensaje: "Producto actualizado correctamente"
        });
    });
});

// DELETE: Eliminar un producto por su ID
app.delete("/producto/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM producto WHERE id_producto = ?";

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al eliminar:", error);
            return res.status(500).json({
                mensaje: "Error al eliminar el producto"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se encontró el producto con ese ID"
            });
        }

        res.json({
            mensaje: "Producto eliminado correctamente"
        });
    });
});

// Iniciar servidor
app.listen(PUERTO, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PUERTO}`);
});
