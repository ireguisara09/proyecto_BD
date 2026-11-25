// URL del backend (la misma que usa app.js)
const API_URL = "https://proyecto-bd-j2qx.onrender.com";

const grid = document.getElementById("destacadosGrid");
const estado = document.getElementById("estadoCarga");
const statProductos = document.getElementById("statProductos");
const statUnidades = document.getElementById("statUnidades");

const moneda = (n) =>
  Number(n).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });

function tarjeta(p) {
  const el = document.createElement("article");
  el.className = "producto reveal visible";

  const stock = Number(p.stock);
  const poco = stock > 0 && stock <= 5;
  const etiqueta = stock === 0 ? "Agotado" : poco ? "Últimas unidades" : "Disponible";
  const clase = stock === 0 ? "agotado" : poco ? "poco" : "ok";

  el.innerHTML = `
    <div class="foto"><span></span></div>
    <div class="info">
      <span class="badge ${clase}">${etiqueta}</span>
      <h3></h3>
      <p class="precio"></p>
      <p class="unidades"></p>
    </div>`;
  el.querySelector(".foto span").textContent = (p.nombre || "?").trim().charAt(0).toUpperCase();
  el.querySelector("h3").textContent = p.nombre;
  el.querySelector(".precio").textContent = moneda(p.precio);
  el.querySelector(".unidades").textContent = `${stock} unidades`;
  return el;
}

async function cargarDestacados() {
  // Render (plan gratis) puede tardar en despertar: avisamos si demora
  const aviso = setTimeout(() => (estado.hidden = false), 3500);

  try {
    const res = await fetch(`${API_URL}/producto`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const productos = await res.json();

    statProductos.textContent = productos.length;
    statUnidades.textContent = productos.reduce((t, p) => t + Number(p.stock || 0), 0).toLocaleString("es-CO");

    grid.innerHTML = "";
    if (productos.length === 0) {
      grid.innerHTML = "<p class='estado'>Pronto tendremos productos nuevos.</p>";
      return;
    }
    // Los más recientes primero (mayor id) y solo 4
    productos
      .slice()
      .sort((a, b) => (b.id_producto || 0) - (a.id_producto || 0))
      .slice(0, 4)
      .forEach((p) => grid.appendChild(tarjeta(p)));
  } catch (e) {
    console.error("Error al cargar destacados:", e);
    grid.innerHTML = "<p class='estado'>No pudimos cargar los productos ahora. Intenta de nuevo en un momento.</p>";
    statProductos.textContent = statUnidades.textContent = "—";
  } finally {
    clearTimeout(aviso);
    estado.hidden = true;
  }
}

// Animación de aparición al hacer scroll
const io = new IntersectionObserver(
  (items) => items.forEach((i) => i.isIntersecting && (i.target.classList.add("visible"), io.unobserve(i.target))),
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

cargarDestacados();
