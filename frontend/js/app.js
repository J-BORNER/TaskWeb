// Archivo principal - inicialización de la aplicación
console.log('🚀 Student Tasks App initialized');

// Configuración global
window.API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : '/api';

// Manejar errores globales
window.addEventListener('error', function(e) {
    console.error('Error global:', e.error);
});

// Prevenir envío de formularios con Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        const form = e.target.closest('form');
        if (form && !form.querySelector('button[type="submit"]')) {
            e.preventDefault();
        }
    }
});

// Función para verificar conexión a la API
async function checkAPIHealth() {
    try {
        const response = await fetch(`${window.API_BASE_URL}`);
        if (!response.ok) {
            console.warn('API might be unavailable');
        }
    } catch (error) {
        console.error('API health check failed:', error);
    }
}

// Verificar API al cargar
document.addEventListener('DOMContentLoaded', function() {
    checkAPIHealth();
});