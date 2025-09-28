// Configuración de la API
const API_BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

// Elementos del DOM
let currentUser = null;

// Verificar autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
});

// Verificar si el usuario está autenticado
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
        try {
            currentUser = JSON.parse(userData);
            showDashboard();
        } catch (error) {
            console.error('Error parsing user data:', error);
            logout();
        }
    } else {
        showLogin();
    }
}

// Mostrar formulario de login
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';

    // Reset forms
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
}

// Mostrar formulario de registro
function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard').style.display = 'none';

    // Reset forms
    document.getElementById('register-name').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
}

// Mostrar dashboard
function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('auth-buttons').style.display = 'none';
    document.getElementById('user-menu').style.display = 'flex';
    document.getElementById('user-name').textContent = currentUser.name;

    // Cargar tareas del usuario
    loadUserTasks();
}

// Función de registro
async function register(event) {
    event.preventDefault();

    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        showLoading('Creando cuenta...');
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('✅ Cuenta creada exitosamente!', 'success');
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } else {
            showMessage(data.error || 'Error en el registro', 'error');
        }
    } catch (error) {
        console.error('Error en registro:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Agregar función de loading
function showLoading(message) {
    // Implementar spinner o mensaje de carga
    console.log('Loading:', message);
}

// Función de login
async function login(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Login exitoso
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;

            showMessage('Login exitoso!', 'success');
            setTimeout(showDashboard, 1000);
        } else {
            showMessage(data.error || 'Error en el login', 'error');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Función de logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;

    document.getElementById('auth-buttons').style.display = 'flex';
    document.getElementById('user-menu').style.display = 'none';
    showLogin();

    showMessage('Sesión cerrada exitosamente', 'success');
}

// Mostrar mensajes
// Mostrar mensajes estilo burbuja en parte inferior centrada
function showMessage(message, type = 'info') {
    // Remover mensajes existentes con efecto de salida
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => {
        msg.style.animation = 'superMessageOutBottom 0.3s ease forwards';
        setTimeout(() => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        }, 300);
    });

    // Crear nuevo mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type} bounce`; // 🔥 Agregar clase bounce
    
    // Agregar ícono según el tipo
    const icon = type === 'success' ? '✅' : 
                 type === 'error' ? '❌' : 
                 '💡';
    
    messageDiv.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 8px;">
            ${icon} ${message}
        </span>
    `;

    // Agregar botón de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
        messageDiv.style.animation = 'superMessageOutBottom 0.3s ease forwards';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    };
    messageDiv.appendChild(closeBtn);

    // Agregar partículas decorativas (opcional)
    if (type === 'success') {
        const particles = document.createElement('div');
        particles.className = 'particles';
        for (let i = 0; i < 5; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particles.appendChild(particle);
        }
        messageDiv.appendChild(particles);
    }

    document.body.appendChild(messageDiv);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.style.animation = 'superMessageOutBottom 0.5s ease forwards';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 500);
        }
    }, 5000);
}

// Función para hacer requests autenticados
async function makeAuthenticatedRequest(url, options = {}) {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (response.status === 401) {
        // Token inválido o expirado
        logout();
        throw new Error('Authentication failed');
    }

    return response;
}