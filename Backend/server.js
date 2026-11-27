
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const conexion = require("./db");
const { subirImgenCloudinary } = require("./cloudinary");

const app = express();

// Middlewares
app.use(cors());

// Limite de 10 MB para el envio de imagenes en Base64 hacia Cloudinary
app.use(express.json({ limit: "10mb" }));

// Verificar que la tabla producto tenga la columna imagen_url
function verificarColumnaImagen() {
    return new Promise((resolve, reject) => {

        conexion.query(
            "SHOW COLUMNS FROM producto LIKE 'imagen_url'",
            (err, resultados) => {

                if (err) {
                    console.error("Error al verificar la columna imagen_url:", err);
                    return reject(err);
                }

                // Si la columna no existe, la creamos
                if (resultados.length === 0) {

                    conexion.query(
                        "ALTER TABLE producto ADD COLUMN imagen_url VARCHAR(500) DEFAULT NULL",
                        (errAlter) => {

                            if (errAlter) {
                                console.error("Error al crear la columna imagen_url:", errAlter);
                                return reject(errAlter);
                            }

                            console.log("Columna imagen_url agregada correctamente a producto");
                            resolve();
                        }
                    );

                } else {
                    console.log("La columna imagen_url ya existe en producto");
                    resolve();
                }
            }
        );
    });
}

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
app.post("/producto", async (req, res) => {
    try {
        const { nombre, precio, stock, imagenBase64, imagen_url } = req.body;
        let urlImgenFinal = imagen_url || null;

        // Si se selecciona una imagen, la subimos a Cloudinary
        if (imagenBase64) {
            urlImgenFinal = await subirImgenCloudinary(imagenBase64);
        }

        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({
                mensaje: "Debes completar todos los campos"
            });
        }

        const sql = `
            INSERT INTO producto (nombre, precio, stock, imagen_url)
            VALUES (?, ?, ?, ?)
        `;

        const valores = [nombre, precio, stock, urlImgenFinal];

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

    } catch (error) {
        console.error("Error al subir imagen o crear producto:", error.message);

        res.status(500).json({
            mensaje: error.message || "Error al subir la imagen a Cloudinary"
        });
    }
});

// PUT: Actualizar un producto por su ID
app.put("/producto/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const { nombre, precio, stock, imagenBase64, imagen_url } = req.body;
        let urlImgenFinal = imagen_url || null;

        // Si se selecciona una nueva imagen, se sube a Cloudinary
        if (imagenBase64) {
            urlImgenFinal = await subirImgenCloudinary(imagenBase64);
        }

        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({
                mensaje: "Debes completar todos los campos"
            });
        }

        const sql = `
            UPDATE producto
            SET nombre = ?, precio = ?, stock = ?,
                imagen_url = COALESCE(?, imagen_url)
            WHERE id_producto = ?
        `;

        const valores = [nombre, precio, stock, urlImgenFinal, id];

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
                mensaje: "Producto actualizado correctamente",
                imagen_url: urlImgenFinal
            });
        });

    } catch (error) {
        console.error("Error al actualizar producto o imagen:", error.message);

        res.status(500).json({
            mensaje: error.message || "Error al actualizar la imagen en Cloudinary"
        });
    }
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

// ====== Rutas Contacto ========

// GET: Obtener todos los mensajes
app.get("/mensajes_contacto", (req, res) => {
    const sql = "SELECT * FROM mensajes_contacto";

    conexion.query(sql, (error, resultados) => {
        if (error) {
            console.error("Error al consultar mensajes:", error);
            return res.status(500).json({
                mensaje: "Error al consultar los mensajes"
            });
        }

        res.json(resultados);
    });
});

// POST: Registrar un mensaje
app.post("/mensajes_contacto", (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    if (![nombre, email, asunto, mensaje].every(
        (valor) => typeof valor === "string" && valor.trim()
    )) {
        return res.status(400).json({
            mensaje: "Debes completar todos los campos"
        });
    }

    const sql = `
        INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje)
        VALUES (?, ?, ?, ?)
    `;

    const valores = [
        nombre.trim(),
        email.trim(),
        asunto.trim(),
        mensaje.trim()
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al registrar el mensaje:", error);
            return res.status(500).json({
                mensaje: "Error al registrar el mensaje"
            });
        }

        res.status(201).json({
            mensaje: "Mensaje registrado correctamente",
            id_mensaje: resultado.insertId
        });
    });
});

// PUT: Actualizar un mensaje por su ID
app.put("/mensajes_contacto/:id", (req, res) => {
    const { nombre, email, asunto, mensaje } = req.body;

    if (![nombre, email, asunto, mensaje].every(
        (valor) => typeof valor === "string" && valor.trim()
    )) {
        return res.status(400).json({
            mensaje: "Debes completar todos los campos"
        });
    }

    const sql = `
        UPDATE mensajes_contacto
        SET nombre = ?, email = ?, asunto = ?, mensaje = ?
        WHERE id_mensaje = ?
    `;

    const valores = [
        nombre.trim(),
        email.trim(),
        asunto.trim(),
        mensaje.trim(),
        req.params.id
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.error("Error al actualizar el mensaje:", error);
            return res.status(500).json({
                mensaje: "Error al actualizar el mensaje"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se encontró el mensaje con ese ID"
            });
        }

        res.json({
            mensaje: "Mensaje actualizado correctamente"
        });
    });
});

// DELETE: Eliminar un mensaje por su ID
app.delete("/mensajes_contacto/:id", (req, res) => {
    const id = req.params.id;

    const sql = "DELETE FROM mensajes_contacto WHERE id_mensaje = ?";

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.error("Error al eliminar:", error);
            return res.status(500).json({
                mensaje: "Error al eliminar el mensaje"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: "No se encontró el mensaje con ese ID"
            });
        }

        res.json({
            mensaje: "Mensaje eliminado correctamente"
        });
    });
});

// Iniciar servidor después de verificar la columna
const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        await verificarColumnaImagen();

        app.listen(PORT, () => {
            console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("No se pudo iniciar el servidor:", error.message);
    }
}

iniciarServidor();
