
const API_URL = "https://proyecto-bd-j2qx.onrender.com";

const listaMensajes = document.getElementById("listaMensajes");
const formulario = document.getElementById("formularioMensaje");
const mensajeId = document.getElementById("mensajeId");
const nombreInput = document.getElementById("nombre");
const emailInput = document.getElementById("email");
const asuntoInput = document.getElementById("asunto");
const mensajeInput = document.getElementById("mensaje");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelar = document.getElementById("btnCancelar");
const tituloFormulario = document.getElementById("tituloFormulario");

async function procesarRespuesta(respuesta) {
  const texto = await respuesta.text();

  let resultado;

  try {
    resultado = JSON.parse(texto);
  } catch {
    console.error("Respuesta recibida del servidor:", texto);
    throw new Error(
      "El servidor devolvió HTML o una respuesta no válida. Verifica la URL y las rutas de la API."
    );
  }

  if (!respuesta.ok) {
    throw new Error(
      resultado.mensaje ||
      resultado.error ||
      `Error HTTP: ${respuesta.status}`
    );
  }

  return resultado;
}

async function cargarMensajes() {
  if (!listaMensajes) return;

  try {
    const mensajes = await procesarRespuesta(
      await fetch(API_URL)
    );

    listaMensajes.innerHTML = "";

    if (!Array.isArray(mensajes)) {
      throw new Error("La API no devolvió una lista de mensajes.");
    }

    if (mensajes.length === 0) {
      listaMensajes.innerHTML =
        "<p style='color: #64748b;'>No hay mensajes registrados.</p>";
      return;
    }

    mensajes.forEach((mensajeContacto) => {
      const elemento = document.createElement("div");
      elemento.classList.add("mensajes_contacto");

      const titulo = document.createElement("h3");
      titulo.textContent = mensajeContacto.asunto;

      const nombre = document.createElement("p");
      nombre.classList.add("mensaje-nombre");
      nombre.textContent = `Nombre: ${mensajeContacto.nombre}`;

      const email = document.createElement("p");
      email.classList.add("mensaje-email");
      email.textContent = `Correo: ${mensajeContacto.email}`;

      const asunto = document.createElement("p");
      asunto.classList.add("mensaje-asunto");
      asunto.textContent = `Asunto: ${mensajeContacto.asunto}`;

      const mensaje = document.createElement("p");
      mensaje.classList.add("mensaje-mensaje");
      mensaje.textContent = `Mensaje: ${mensajeContacto.mensaje}`;

      const acciones = document.createElement("div");
      acciones.classList.add("acciones");

      const btnEditar = document.createElement("button");
      btnEditar.type = "button";
      btnEditar.classList.add("btn-editar");
      btnEditar.textContent = "Editar";

      btnEditar.addEventListener("click", () => {
        cargarEnFormulario(mensajeContacto);
      });

      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.classList.add("btn-eliminar");
      btnEliminar.textContent = "Eliminar";

      btnEliminar.addEventListener("click", () => {
        eliminarMensaje(mensajeContacto.id_mensaje);
      });

      acciones.append(btnEditar, btnEliminar);
      elemento.append(titulo, nombre, email, asunto, mensaje, acciones);
      listaMensajes.appendChild(elemento);
    });
  } catch (error) {
    console.error("Error al cargar mensajes:", error);

    listaMensajes.innerHTML =
      "<p>No se pudieron cargar los mensajes. Revisa el servidor y la ruta de la API.</p>";
  }
}

function cargarEnFormulario(mensajeContacto) {
  mensajeId.value = mensajeContacto.id_mensaje;
  nombreInput.value = mensajeContacto.nombre;
  emailInput.value = mensajeContacto.email;
  asuntoInput.value = mensajeContacto.asunto;
  mensajeInput.value = mensajeContacto.mensaje;

  tituloFormulario.textContent = "Editar Mensaje";
  btnGuardar.textContent = "Actualizar Mensaje";
  btnCancelar.style.display = "block";

  nombreInput.focus();
}

function cancelarEdicion() {
  formulario.reset();
  mensajeId.value = "";

  tituloFormulario.textContent = "Registrar Mensaje";
  btnGuardar.textContent = "Guardar Mensaje";
  btnCancelar.style.display = "none";
}

if (btnCancelar) {
  btnCancelar.addEventListener("click", cancelarEdicion);
}

if (formulario) {
  formulario.addEventListener("submit", async (event) => {
    event.preventDefault();

    const id = mensajeId.value;
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const asunto = asuntoInput.value.trim();
    const mensaje = mensajeInput.value.trim();

    if (!nombre || !email || !asunto || !mensaje) {
      alert("Completa todos los campos con valores válidos.");
      return;
    }

    const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formatoEmail.test(email)) {
      alert("Ingresa un correo electrónico válido.");
      emailInput.focus();
      return;
    }

    const datos = { nombre, email, asunto, mensaje };

    try {
      const respuesta = await fetch(
        id ? `${API_URL}/${id}` : API_URL,
        {
          method: id ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(datos)
        }
      );

      const resultado = await procesarRespuesta(respuesta);

      alert(resultado.mensaje || "Mensaje guardado correctamente.");

      cancelarEdicion();
      await cargarMensajes();
    } catch (error) {
      console.error("Error al guardar o actualizar:", error);
      alert("No se pudo guardar el mensaje: " + error.message);
    }
  });
}

async function eliminarMensaje(id) {
  const confirmar = confirm(
    "¿Deseas eliminar este mensaje de la base de datos?"
  );

  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    });

    await procesarRespuesta(respuesta);

    if (mensajeId.value == id) {
      cancelarEdicion();
    }

    alert("Mensaje eliminado correctamente.");
    await cargarMensajes();
  } catch (error) {
    console.error("Error al eliminar:", error);
    alert("No se pudo eliminar el mensaje: " + error.message);
  }
}

cargarMensajes();
