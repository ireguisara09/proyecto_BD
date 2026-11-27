require("dotenv").config();
const cloudinary = require("cloudinary").v2

// Configuración de almacenamiento en la nube
// Usamos un metodo .trim() para eliminar los espacios accidentales al final de cada linea en .env

const cloudName = (process.env.CLOUDINARY_CLOUD_NAME || "").trim();
const apiKey = (process.env.CLOUDINARY_API_KEY || "").trim();
const apiSecret = (process.env.CLOUDINARY_API_SECRET || "").trim();

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Recibe una imagen en un formato llamado Base64 desde el frontend, la sube a cloudinary 
// en la carpeta "mi_tienda_productos" y retorna un enlace seguro de tipo (https)

async function subirImgenCloudinary(imagenBase64) {
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error(
            "Faltan las credenciales de Cloudinary en el archivo .env"
        );
        
    }

    // Si para detectar si el API SECRET se copio truncado o incompleto desde la tabla de Cloudinary
    if (apiSecret.includes("...")) {
        throw new Error (
            "Tu API_SECRET en .env esta incompleta"
        );
    }

    const  resultado = await cloudinary.uploader.upload(imagenBase64,{
        folder: "mi_tienda_productos",
        resource_type: "image",
    });

    // Retornamos la URL publica segura (https://..........)

    return resultado.secure_url;
}

module.exports = { cloudinary, subirImgenCloudinary};