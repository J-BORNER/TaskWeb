// Variables globales
let userTasks = [];

// Cargar tareas del usuario
async function loadUserTasks() {
    if (!currentUser) return;
    
    try {
        const response = await makeAuthenticatedRequest(
            `${API_BASE_URL}/tasks/user/${currentUser.id}`
        );
        
        if (response.ok) {
            const data = await response.json();
            userTasks = data.tasks || [];
            renderTasks();
            updateStats();
        } else {
            throw new Error('Error loading tasks');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showMessage('Error cargando tareas', 'error');
    }
}

// Renderizar lista de tareas
function renderTasks() {
    const tasksList = document.getElementById('tasks-list');
    
    if (userTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="message">
                <p>No hay tareas registradas. ¡Crea tu primera tarea!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = userTasks.map(task => `
        <div class="task-item fade-in" data-task-id="${task.id}">
            <div class="task-info">
                <h3>${escapeHtml(task.title)}</h3>
                ${task.description ? `<p>${escapeHtml(task.description)}</p>` : ''}
                <div class="task-meta">
                    Creada: ${new Date(task.created_at).toLocaleDateString()}
                    ${task.assigned_at ? ` • Asignada: ${new Date(task.assigned_at).toLocaleDateString()}` : ''}
                </div>
            </div>
            <div class="task-actions">
                <span class="status-badge status-${task.status.replace('_', '-')}">
                    ${getStatusText(task.status)}
                </span>
                ${task.status !== 'done' ? `
                    <button onclick="updateTaskStatus(${task.id}, '${getNextStatus(task.status)}')" 
                            class="btn btn-${getNextStatusButtonType(task.status)}">
                        ${getNextStatusAction(task.status)}
                    </button>
                ` : ''}
                <button onclick="deleteTask(${task.id})" class="btn btn-outline">Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Actualizar estadísticas
function updateStats() {
    const pendingCount = userTasks.filter(task => task.status === 'pending').length;
    const inProgressCount = userTasks.filter(task => task.status === 'in_progress').length;
    const doneCount = userTasks.filter(task => task.status === 'done').length;
    
    document.getElementById('pending-count').textContent = pendingCount;
    document.getElementById('in-progress-count').textContent = inProgressCount;
    document.getElementById('done-count').textContent = doneCount;
}

// Mostrar modal para crear tarea
function showCreateTaskModal() {
    document.getElementById('create-task-modal').style.display = 'flex';
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
}

// Cerrar modal
function closeCreateTaskModal() {
    document.getElementById('create-task-modal').style.display = 'none';
}

// Crear nueva tarea
async function createTask(event) {
    event.preventDefault();
    
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-description').value;
    
    if (!title.trim()) {
        showMessage('El título es requerido', 'error');
        return;
    }
    
    try {
        const response = await makeAuthenticatedRequest(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            body: JSON.stringify({
                title: title.trim(),
                description: description.trim(),
                user_id: currentUser.id
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            closeCreateTaskModal();
            showMessage('Tarea creada exitosamente!', 'success');
            loadUserTasks(); // Recargar lista
        } else {
            showMessage(data.error || 'Error creando tarea', 'error');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Actualizar estado de tarea
async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await makeAuthenticatedRequest(
            `${API_BASE_URL}/tasks/${taskId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('Estado actualizado!', 'success');
            loadUserTasks(); // Recargar lista
        } else {
            showMessage(data.error || 'Error actualizando tarea', 'error');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Eliminar tarea
async function deleteTask(taskId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        return;
    }
    
    try {
        const response = await makeAuthenticatedRequest(
            `${API_BASE_URL}/tasks/${taskId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showMessage('Tarea eliminada!', 'success');
            loadUserTasks(); // Recargar lista
        } else {
            const data = await response.json();
            showMessage(data.error || 'Error eliminando tarea', 'error');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        showMessage('Error de conexión', 'error');
    }
}

// Funciones auxiliares
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'in_progress': 'En Progreso',
        'done': 'Completada'
    };
    return statusMap[status] || status;
}

function getNextStatus(currentStatus) {
    const statusFlow = {
        'pending': 'in_progress',
        'in_progress': 'done',
        'done': 'done'
    };
    return statusFlow[currentStatus] || 'pending';
}

function getNextStatusAction(currentStatus) {
    const actionMap = {
        'pending': 'Comenzar',
        'in_progress': 'Completar',
        'done': 'Completada'
    };
    return actionMap[currentStatus] || 'Siguiente';
}

function getNextStatusButtonType(currentStatus) {
    const typeMap = {
        'pending': 'success',
        'in_progress': 'warning',
        'done': 'outline'
    };
    return typeMap[currentStatus] || 'primary';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('create-task-modal');
    if (event.target === modal) {
        closeCreateTaskModal();
    }
});