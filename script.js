// Variables del DOM
const productsGrid = document.getElementById('productsGrid');
const loadMoreBtn = document.getElementById('loadMore');
let visibleProducts = 8;
let allProducts = [];
let isLoading = false;
let currentImageModal = null;

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
        
        const response = await fetch('products.json');
        if (!response.ok) throw new Error('Error al cargar los productos');
        
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

// Función para crear el modal de imágenes y video
function createImageModal(images, title, video = null) {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    
    // Crear pestañas
    let tabsHTML = '';
    let contentHTML = '';
    
    if (video) {
        tabsHTML = `
            <div class="modal-tabs">
                <button class="tab-btn active" data-tab="images">Imágenes</button>
                <button class="tab-btn" data-tab="video">Video</button>
            </div>
        `;
        
        contentHTML = `
            <div class="tab-content active" id="images-tab">
                <div class="main-image-container">
                    <img src="${images[0]}" alt="${title}" class="main-image">
                    <div class="zoom-area"></div>
                </div>
                <div class="thumbnail-container">
                    ${images.map((img, index) => `
                        <img src="${img}" alt="${title} - thumbnail ${index + 1}" 
                             class="thumbnail ${index === 0 ? 'active' : ''}"
                             data-index="${index}">
                    `).join('')}
                </div>
            </div>
            <div class="tab-content" id="video-tab">
                <div class="video-container">
                    <iframe width="100%" height="500" src="${video}" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen></iframe>
                </div>
            </div>
        `;
    } else {
        contentHTML = `
            <div class="main-image-container">
                <img src="${images[0]}" alt="${title}" class="main-image">
                <div class="zoom-area"></div>
            </div>
            <div class="thumbnail-container">
                ${images.map((img, index) => `
                    <img src="${img}" alt="${title} - thumbnail ${index + 1}" 
                         class="thumbnail ${index === 0 ? 'active' : ''}"
                         data-index="${index}">
                `).join('')}
            </div>
        `;
    }

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            ${tabsHTML}
            ${contentHTML}
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

// Función para inicializar eventos del modal
function initModalEvents(modal, images, video = null) {
    const closeBtn = modal.querySelector('.close-modal');
    
    // Cerrar modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        currentImageModal = null;
    });
    
    // Cerrar al hacer clic fuera del contenido
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            currentImageModal = null;
        }
    });
    
    // Manejar pestañas si hay video
    if (video) {
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabContents = modal.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remover clase active de todos los botones y contenidos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Agregar clase active al botón y contenido seleccionado
                btn.classList.add('active');
                const tabId = btn.dataset.tab;
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }
    
    // Configurar zoom solo para la pestaña de imágenes
    if (images.length > 0) {
        const mainImage = modal.querySelector('.main-image');
        const thumbnails = modal.querySelectorAll('.thumbnail');
        const zoomArea = modal.querySelector('.zoom-area');
        
        // Cambiar imagen al hacer clic en thumbnail
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = thumb.dataset.index;
                mainImage.src = images[index];
                
                // Actualizar thumbnails activos
                thumbnails.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
        
        // Zoom con la rueda del mouse
        let scale = 1;
        mainImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = -e.deltaY;
            
            if (delta > 0) {
                scale *= 1.1;
            } else {
                scale /= 1.1;
            }
            
            // Limitar zoom mínimo y máximo
            scale = Math.min(Math.max(1, scale), 4);
            mainImage.style.transform = `scale(${scale})`;
        });
        
        // Mostrar área de zoom al pasar el mouse
        mainImage.addEventListener('mousemove', (e) => {
            if (scale <= 1) return;
            
            const rect = mainImage.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Calcular posición del zoom
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            
            zoomArea.style.display = 'block';
            zoomArea.style.left = `${xPercent}%`;
            zoomArea.style.top = `${yPercent}%`;
            zoomArea.style.transform = 'translate(-50%, -50%)';
        });
        
        mainImage.addEventListener('mouseleave', () => {
            zoomArea.style.display = 'none';
        });
        
        // Resetear zoom al cambiar de imagen
        mainImage.addEventListener('load', () => {
            scale = 1;
            mainImage.style.transform = 'scale(1)';
        });
    }
}

// Función para mostrar el modal de imágenes/video
function showImageModal(product) {
    // Cerrar modal existente si hay uno
    if (currentImageModal) {
        currentImageModal.style.display = 'none';
        document.body.removeChild(currentImageModal);
    }
    
    // Obtener imágenes (compatibilidad con version anterior)
    const images = Array.isArray(product.image) ? product.image : [product.image];
    
    // Crear nuevo modal
    const modal = createImageModal(images, product.title, product.video || null);
    initModalEvents(modal, images, product.video || null);
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    currentImageModal = modal;
}

// Función para renderizar productos
function renderProducts(productsToShow) {
    productsGrid.innerHTML = '';
    const fragment = document.createDocumentFragment(); 
    const productsToDisplay = allProducts.slice(0, productsToShow);
    
    if (productsToDisplay.length === 0) {
        productsGrid.innerHTML = '<p class="no-products">No hay productos disponibles</p>';
        return;
    }
    
    productsToDisplay.forEach((product, index) => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.style.animationDelay = `${index * 0.1}s`;
        
        // Verificar si el producto tiene múltiples imágenes
        const images = Array.isArray(product.image) ? product.image : [product.image];
        
        // HTML condicional para el indicador de video
        const videoIndicator = product.video ? 
            '<div class="video-indicator">🎥 Video disponible</div>' : '';
        
        productCard.innerHTML = `
            <div class="product-image-container">
                <img src="${images[0]}" alt="${product.title}" class="product-image">
                ${images.length > 1 ? `<div class="image-counter">+${images.length - 1}</div>` : ''}
                ${product.video ? '<div class="video-badge"><i class="fas fa-video"></i></div>' : ''}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.title}</h3>
                <p class="product-description">${product.description}</p>
                ${videoIndicator}
            </div>
        `;
        
        // Agregar evento para mostrar el modal
        const imageContainer = productCard.querySelector('.product-image-container');
        imageContainer.addEventListener('click', () => {
            showImageModal(product);
        });
        
        fragment.appendChild(productCard);
    });
    
    productsGrid.appendChild(fragment);
    loadMoreBtn.style.display = allProducts.length > visibleProducts ? 'flex' : 'none';
}

// Evento para cargar más productos
loadMoreBtn.addEventListener('click', async () => {
    if (isLoading) return;
    
    isLoading = true;
    loadMoreBtn.classList.add('loading');
    
    // Simular carga
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    visibleProducts += 8; 
    renderProducts(visibleProducts);
    
    isLoading = false;
    loadMoreBtn.classList.remove('loading');
});

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Configurar partículas si la librería está disponible
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
    
    // Configurar smooth scrolling para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Cargar productos
    loadProducts();
});