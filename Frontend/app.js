
const API_URL =
window.location.hostname === "localhost" ||
window.location.hostname === "127.0.0.1" ||
window.location.protocol === "file:"
 ? "http://localhost:3000"
 : "https://proyecto-bd-j2qx.onrender.com";

// Nos aseguramos de que se consuma el localhost y no el otro para seguir en producción

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const imagenUrlActualInput = document.getElementById("imagenUrlActual");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const imagenArchivoInput = document.getElementById("imagenArchivo");
const contenedorVistaPrevia = document.getElementById("contenedorVistaPrevia");
const vistaPreviaImagen = document.getElementById("vistaPreviaImagen");
const textoVistaPrevia = document.getElementById("textoVistaPrevia");

const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const formContacto = document.getElementById("formularioContacto");


// Guardamos los productos en memoria para cargarlos facilmente al editar

let productosMemoria = [];

// Creación de imagen vectorial - es decir fabricada con vectores SVH (no por pixeles), 
// por defecto cuando un producto aun no tienen imagen subida a Cloudinary

const IMAGEN_POR_DEFECTO =
 "data:image/svg+xml;utf8," +
 encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
       <stop offset="0%" stop-color="#2a0f1e"/>
       <stop offset="100%" stop-color="#8a1e5b"/>
      </linearGradient>
    </defs>

   <rect width="400" height="280" fill="url(#bg)"/>
   <rect x="135" y="70" width="130" height="90" rx="10" fill="none" stroke="#fa60e3" stroke-width="4"/>
   <line x1="175" y1="180" x2="255" y2="180" stroke="#fa60e3" stroke-width="4" stroke-linecap="round"/>
   <line x1="200" y1="160" x2="200" y2="180" stroke="#fa60e3" stroke-width="4"/>
   <text x="200" y="220" font-family="Arial, sans-serif" font-size="15" fill="#fa60e3" text-anchor="middle">
     MiTienda Tech - Sin imagen
   </text>
  </svg>
  `);

//  Convertir un archivo seleccionado en <input type="file" a cadena Base64
function convertirArchivoBase64(archivo) {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result);
    lector.onerror = (error) => reject(error);
    lector.readAsDataURL(archivo)
  });
}

// Mostrar vista previa inmediata cuando el usuari escoge una imagen de su PC

if (imagenArchivoInput) {
  imagenArchivoInput.addEventListener("change", async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return; 

    const Base64 = await convertirArchivoBase64(archivo);
    vistaPreviaImagen.src = Base64;
    contenedorVistaPrevia.style.display = "flex";
  });
}

// 1. Consultar y mostrar productos (READ)
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/producto`);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const productos = await respuesta.json();
    productosMemoria = Array.isArray(productos) ? productos : [];

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML =
        "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }



    productosMemoria.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      const urlFoto = producto.imagen_url ? producto.imagen_url : IMAGEN_POR_DEFECTO;

      elemento.innerHTML = `
          <div class="producto-imagen-box">
          <img src="${urlFoto}" alt="${producto.nombre}" class="producto-img" />
        </div>
        <div class="producto-cuerpo">
          <div>
          <h3>${producto.nombre}</h3>
          <p class="producto-precio">Precio: $${producto.precio}</p>
            <p class="producto-stock">Stock: ${producto.stock} unidades</p>
        </div>
        <div class="acciones">
            <button type="button" class="btn-editar">Editar</button>
            <button type="button" class="btn-eliminar">Eliminar</button>
        </div>
        </div>
      `;

      // Mostrar datos del producto
      elemento.querySelector("h3").textContent = producto.nombre;
      elemento.querySelector(".producto-precio").textContent =
        `Precio: $${producto.precio}`;
      elemento.querySelector(".producto-stock").textContent =
        `Stock: ${producto.stock} unidades`;

      // Editar producto usando id_producto
      elemento.querySelector(".btn-editar").addEventListener("click", () => {
        cargarEnFormulario(
          producto.id_producto
        );
      });

      // Eliminar producto usando id_producto
      elemento.querySelector(".btn-eliminar").addEventListener("click", () => {
        eliminarProducto(producto.id_producto);
      });

      listaProductos.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
    listaProductos.innerHTML =
      "<p>No se pudieron cargar los productos. Revisa el servidor.</p>";
  }
}

// 2. Cargar datos del producto en el formulario (UPDATE - paso 1)
function cargarEnFormulario(id) {
  const producto = productosMemoria.find((p) => p.id_producto === id);
  if (!producto) return; 

  productoId.value = producto.id_producto;
  nombreInput.value = producto.nombre;
  precioInput.value = producto.precio;
  stockInput.value = producto.stock;
  imagenUrlActualInput.value = producto.imagen_url || "";
  if (imagenArchivoInput) imagenArchivoInput.value = ""; 

  if (producto.imagen_url && contenedorVistaPrevia){
    vistaPreviaImagen.src = producto.imagen_url;
    textoVistaPrevia.textContent = "Imgen actual en Cloudinary (elige otra si deseas cambiar)";
    contenedorVistaPrevia.style.display = "flex"; 
  } else if (contenedorVistaPrevia) {
    contenedorVistaPrevia.style.display = "none";
  }

  

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";

  nombreInput.focus();
}

// 3. Cancelar edición y limpiar formulario
function cancelarEdicion() {
  if (!formulario) return;
  formulario.reset();
  productoId.value = "";
  
  if (imagenUrlActualInput) imagenUrlActualInput.value = "";
  if (contenedorVistaPrevia) contenedorVistaPrevia.style.display = "none";
  tituloFormulario.textContent = "Registrar Producto";
  btnGuardar.textContent = "Guardar Producto";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

// 4. Registrar o actualizar producto (CREATE / UPDATE)
if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = productoId.value;
    const nombre = nombreInput.value.trim();
    const precio = Number(precioInput.value);
    const stock = Number(stockInput.value);
    const imagen_url = imagenUrlActualInput ? imagenUrlActualInput.value : null; 
    const archivoSeleccionado = imagenArchivoInput?.files[0];

    const textoOriginalBoton = btnGuardar.textContent; 

    // Validar los datos
    if (
      !nombre ||
      precioInput.value === "" ||
      stockInput.value === "" ||
      !Number.isFinite(precio) ||
      !Number.isFinite(stock) ||
      precio < 0 ||
      stock < 0
    ) {
      alert("Completa todos los campos con valores válidos.");
      return;
    }

    const datos = { nombre, precio, stock, imagen_url };

    try {
      if (archivoSeleccionado) {
        datos.imagenBase64 = await convertirArchivoBase64(archivoSeleccionado);
      }

      const respuesta = await fetch(
        id
          ? `${API_URL}/producto/${id}`
          : `${API_URL}/producto`,
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(datos)
        }
      );

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || `Error HTTP: ${respuesta.status}`
        );
      }

      alert(resultado.mensaje);

      cancelarEdicion();
      await cargarProductos();
    } catch (error) {
      console.error("Error al guardar o actualizar:", error);
      alert("No se pudo guardar el producto: " + error.message);
    }
  });
}

// 5. Eliminar producto (DELETE)
async function eliminarProducto(id) {
  const confirmar = confirm(
    "¿Deseas eliminar este producto de la base de datos?"
  );

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/producto/${id}`, {
      method: "DELETE"
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(
        resultado.mensaje || `Error HTTP: ${respuesta.status}`
      );
    }

    alert(resultado.mensaje);

    // Cancelar edición si se estaba editando el mismo producto
    if (productoId.value == id) {
      cancelarEdicion();
    }

    await cargarProductos();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar el producto: " + error.message);
  }
}

// 6. Formulario de contacto
if (formContacto) {
  formContacto.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("¡Mensaje de contacto enviado con éxito!");
    formContacto.reset();
  });
}

// 7. Cargar productos al iniciar la página
cargarProductos();
