const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  },
  pool: { min: 0, max: 80 }
});

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// CRUD Routes for tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await knex('tasks').select();
    res.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.get('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const task = await knex('tasks').where({ id }).first();
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (error) {
    console.error('Failed to fetch task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, description, priority, dueDate, status } = req.body;
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string' });
  }
  try {
    const taskId = await knex('tasks').insert({
      title,
      description: description || '', // Default value if description is not provided
      priority: priority || 'medium', // Default value if priority is not provided
      due_date: dueDate || new Date().toISOString().split('T')[0], // Default value to current date
      status: status || 'pending' // Default value if status is not provided
    }).returning('id');
    res.status(201).json({ message: 'Task created', taskId: taskId[0] });
  } catch (error) {
    console.error('Failed to create task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.put('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, dueDate, status } = req.body;
  if (title && typeof title !== 'string') {
    return res.status(400).json({ error: 'Title must be a string' });
  }
  try {
    const rowsUpdated = await knex('tasks').where({ id }).update({
      title,
      description: description || '',
      priority: priority || 'medium',
      due_date: dueDate || new Date().toISOString().split('T')[0],
      status: status || 'pending'
    });
    if (rowsUpdated === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task updated' });
  } catch (error) {
    console.error('Failed to update task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const rowsDeleted = await knex('tasks').where({ id }).del();
    if (rowsDeleted === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('Failed to delete task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Endpoint to reorder tasks
app.put('/tasks/reorder', async (req, res) => {
  const updatedTasks = req.body;

  try {
    if (!Array.isArray(updatedTasks) || updatedTasks.some(task => typeof task.id !== 'number' || typeof task.position !== 'number')) {
      return res.status(400).json({ error: 'Invalid input format' });
    }

    const updatePromises = updatedTasks.map(task => (
      knex('tasks')
        .where({ id: task.id })
        .update({ position: task.position })
    ));

    await Promise.all(updatePromises);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    console.error('Failed to reorder tasks:', error);
    res.status(500).json({ error: 'Failed to reorder tasks' });
  }
});
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});