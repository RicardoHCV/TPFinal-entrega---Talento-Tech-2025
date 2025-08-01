let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
const contador = document.getElementById("contador-carrito");

// 1. Función para sincronizar el carrito
function sincronizarCarrito() {
  localStorage.setItem('carrito', JSON.stringify(carrito));
  actualizarContador();
  actualizarVistaCarrito();
}

// 2. Actualizar contador
function actualizarContador() {
  if (contador) contador.textContent = carrito.length;
}

// 3. Cargar productos
async function cargarProductos() {
  try {
    
    const response = await fetch(`./productos.json?t=${Date.now()}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) throw new Error("Error HTTP: " + response.status);
    
    const productos = await response.json();
    const contenedor = document.getElementById("contenedor-productos");
    if (!contenedor) return;

    contenedor.innerHTML = productos.map(producto => `
      <div class="tarjeta">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <div class="precio-compra">
          <p class="precio">$${producto.precio}</p>
          <button class="boton-compra" data-id="${producto.id}">Agregar</button>
        </div>
      </div>
    `).join('');

    // Eventos para botones de agregar
    document.querySelectorAll(".boton-compra").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        const producto = productos.find(p => p.id === id);
        if (producto) {
          carrito.push(producto);
          sincronizarCarrito();
        }
      });
    });

  } catch (error) {
    console.error("Error:", error);
    const contenedor = document.getElementById("contenedor-productos");
    if (contenedor) {
      contenedor.innerHTML = `<p class="error">⚠️ Error al cargar productos. Recarga la página.</p>`;
    }
  }
}

// 4. Funciones del carrito
function mostrarCarrito() {
  const modal = document.getElementById('modal-carrito');
  if (modal) modal.style.display = 'flex';
  actualizarVistaCarrito();
}

function cerrarModal() {
  const modal = document.getElementById('modal-carrito');
  if (modal) modal.style.display = 'none';
}

function actualizarVistaCarrito() {
  const lista = document.getElementById('lista-carrito');
  const totalElement = document.getElementById('total-carrito');
  
  if (!lista || !totalElement) return;
  
  lista.innerHTML = carrito.map(item => `
    <div class="item-carrito">
      <span>${item.nombre} - $${item.precio}</span>
      <button class="eliminar-item" data-id="${item.id}">✕</button>
    </div>
  `).join('') || '<p>Carrito vacío</p>';

  totalElement.textContent = carrito.reduce((sum, item) => sum + item.precio, 0);
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  if (confirm("¿Vaciar todo el carrito?")) {
    carrito = [];
    sincronizarCarrito();
  }
}

function finalizarCompra() {
  if (carrito.length === 0) {
    alert("El carrito está vacío");
    return;
  }
  
  const total = carrito.reduce((sum, item) => sum + item.precio, 0);
  if (confirm(`¿Confirmar compra de ${carrito.length} productos por $${total}?`)) {
    carrito = [];
    sincronizarCarrito();
    cerrarModal();
    alert("¡Compra exitosa!");
  }
}

// 5. Configuración de eventos segura
function configurarEventos() {
  // Carrito
  const carritoBtn = document.querySelector('.carrito-btn');
  const vaciarBtn = document.getElementById('vaciar-carrito');
  const finalizarBtn = document.getElementById('finalizar-compra');
  
  if (carritoBtn) carritoBtn.addEventListener('click', mostrarCarrito);
  if (vaciarBtn) vaciarBtn.addEventListener('click', vaciarCarrito);
  if (finalizarBtn) finalizarBtn.addEventListener('click', finalizarCompra);

  // Eliminar items
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('eliminar-item')) {
      const id = parseInt(e.target.getAttribute('data-id'));
      carrito = carrito.filter(item => item.id !== id);
      sincronizarCarrito();
    }
  });

  // Menú hamburguesa
  const menuBtn = document.querySelector('.menu-hamburguesa');
  if (menuBtn) {
    menuBtn.addEventListener('click', function() {
      this.classList.toggle('activo');
      const menu = document.querySelector('.menu');
      if (menu) menu.classList.toggle('activo');
    });
  }
}

// 6. Inicialización
function iniciar() {
  
  configurarEventos();
  actualizarContador();
  cargarProductos();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}