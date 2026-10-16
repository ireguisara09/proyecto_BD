
const API_URL = "https://proyecto-bd-j2qx.onrender.com";

// Elementos del DOM
const listaProductos = document.getElementById("listaProductos");
const formulario = document.getElementById("formularioProducto");
const productoId = document.getElementById("productoId");
const nombreInput = document.getElementById("nombre");
const precioInput = document.getElementById("precio");
const stockInput = document.getElementById("stock");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");
const formContacto = document.getElementById("formularioContacto");

// 1. Consultar y mostrar productos (READ)
async function cargarProductos() {
  if (!listaProductos) return;

  try {
    const respuesta = await fetch(`${API_URL}/producto`);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const productos = await respuesta.json();

    listaProductos.innerHTML = "";

    if (productos.length === 0) {
      listaProductos.innerHTML =
        "<p style='color: #64748b;'>No hay productos registrados.</p>";
      return;
    }

    productos.forEach((producto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("producto");

      elemento.innerHTML = `
        <div>
          <h3></h3>
          <p class="producto-precio"></p>
          <p class="producto-stock"></p>
        </div>
        <div class="acciones">
          <button type="button" class="btn-editar">Editar</button>
          <button type="button" class="btn-eliminar">Eliminar</button>
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
          producto.id_producto,
          producto.nombre,
          producto.precio,
          producto.stock
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
function cargarEnFormulario(id, nombre, precio, stock) {
  productoId.value = id;
  nombreInput.value = nombre;
  precioInput.value = precio;
  stockInput.value = stock;

  tituloFormulario.textContent = "Editar Producto";
  btnGuardar.textContent = "Actualizar Producto";
  btnCancelar.style.display = "block";

  nombreInput.focus();
}

// 3. Cancelar edición y limpiar formulario
function cancelarEdicion() {
  formulario.reset();
  productoId.value = "";

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

    const datos = { nombre, precio, stock };

    try {
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
