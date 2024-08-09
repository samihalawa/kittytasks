document.addEventListener('DOMContentLoaded', function() {
  // Drag-and-drop functionality
  new Sortable(document.getElementById('task-list'), {
    animation: 150,
    onEnd: function(evt) {
      let taskOrder = [];
      document.querySelectorAll('.task-item').forEach(function(item) {
        taskOrder.push(item.getAttribute('data-id'));
      });
      fetch('/update-task-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order: taskOrder })
      });
    }
  });

  // Check due dates for notifications
  checkDueDates();
});

function toggleIdeaSection() {
  const ideaSection = document.getElementById('idea-section');
  if (ideaSection.style.display === 'none') {
    ideaSection.style.display = 'block';
  } else {
    ideaSection.style.display = 'none';
  }
}

function filterTasks() {
  const query = document.getElementById('task-search').value.toLowerCase();
  document.querySelectorAll('.task-item').forEach(task => {
    const title = task.innerText.toLowerCase();
    if (title.includes(query)) {
      task.style.display = '';
    } else {
      task.style.display = 'none';
    }
  });
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
}

function exportTasks() {
  fetch('/tasks')
    .then(response => response.json())
    .then(tasks => {
      const blob = new Blob([JSON.stringify(tasks)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tasks.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
}

function importTasks() {
  const file = document.getElementById('import-tasks-file').files[0];
  const reader = new FileReader();
  reader.onload = function(event) {
    const tasks = JSON.parse(event.target.result);
    fetch('/tasks/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tasks)
    });
  };
  reader.readAsText(file);
}

function showTaskModal(taskId) {
  fetch(`/tasks/${taskId}`)
    .then(response => response.json())
    .then(task => {
      document.getElementById('task-modal-content').innerText = JSON.stringify(task, null, 2);
      document.getElementById('task-modal').style.display = 'block';
    });
}

function closeTaskModal() {
  document.getElementById('task-modal').style.display = 'none';
}

function checkDueDates() {
  fetch('/tasks')
    .then(response => response.json())
    .then(tasks => {
      tasks.forEach(task => {
        const dueDate = new Date(task.due_date);
        const now = new Date();
        if (dueDate - now < 24 * 60 * 60 * 1000) { // Less than 24 hours
          showNotification(`Task "${task.title}" is due soon!`);
        }
      });
    });
}

function showNotification(message) {
  if (Notification.permission === 'granted') {
    new Notification(message);
  }
}

if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      checkDueDates();
    }
  });
}
