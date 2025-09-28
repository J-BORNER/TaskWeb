// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    loadUserTasks();
});

function checkAuthStatus() {
    const userData = localStorage.getItem('user');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    document.getElementById('user-greeting').textContent = `Hola, ${user.name}`;
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Esta función se moverá de tasks.js a dashboard.js
function loadUserTasks() {
    const userData = localStorage.getItem('user');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    // La implementación completa estará en tasks.js
    console.log('Cargando tareas para:', user.id);
}