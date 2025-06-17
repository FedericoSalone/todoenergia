// Variables del DOM
const productsGrid = document.getElementById('productsGrid');
const loadMoreBtn = document.getElementById('loadMore');
let visibleProducts = 8; // Cambiado de 6 a 8 productos iniciales
let allProducts = [];
let isLoading = false;

// Función para cargar productos desde JSON
async function loadProducts() {
    try {
        // Mostrar loader
        productsGrid.innerHTML = `
            <div class="loader">
                <div class="loader-spinner"></div>
                <p>Cargando catálogo...</p>
            </div>
        `;
        
        // Simular carga desde un archivo JSON externo
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Error al cargar los productos');
        }
        
        allProducts = await response.json();
        renderProducts(visibleProducts);
        
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>No se pudieron cargar los productos. Por favor intenta nuevamente más tarde.</p>
            </div>
        `;
    }
}

// Función para renderizar productos
function renderProducts(productsToShow) {
    // Limpiar el grid
    productsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment(); 
    // Mostrar solo la cantidad especificada
    const productsToDisplay = allProducts.slice(0, productsToShow);
    
    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
        return;
    }
    
    // Crear tarjetas de producto
    productsToDisplay.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        fragment.appendChild(productCard);
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
    
    // Mostrar u ocultar botón "Cargar más"
    if (allProducts.length > visibleProducts) {
        loadMoreBtn.style.display = 'flex';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Evento para cargar más productos
loadMoreBtn.addEventListener('click', async () => {
    if (isLoading) return;
    
    isLoading = true;
    loadMoreBtn.classList.add('loading');
    
    // Simular carga con timeout (en producción esto sería una llamada API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    visibleProducts += 8; 
    renderProducts(visibleProducts);
    
    isLoading = false;
    loadMoreBtn.classList.remove('loading');
});

// Inicializar partículas y cargar productos
document.addEventListener('DOMContentLoaded', () => {
    // Configuración de partículas
    if (window.particlesJS) {
        particlesJS('particles', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#FFD700" },
                shape: { 
                    type: "circle",
                    stroke: { width: 0, color: "#FFD700" },
                    polygon: { nb_sides: 5 }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: "#FFD700",
                    opacity: 0.2,
                    width: 1,
                    shadow: {
                        enable: true,
                        blur: 5,
                        color: "#FFD700"
                    }
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: { enable: true, rotateX: 600, rotateY: 1200 }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: { enable: true, mode: "repulse" },
                    onclick: { enable: true, mode: "push" },
                    resize: true
                },
                modes: {
                    repulse: { distance: 100, duration: 0.4 },
                    push: { particles_nb: 4 }
                }
            },
            retina_detect: true
        });
    }
    
    // Cargar productos
    loadProducts();
});

// Efecto de scroll suave
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});