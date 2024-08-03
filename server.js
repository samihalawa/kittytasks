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

app.get('/tasks', async (req, res) => {
    try {
        const tasks = await knex('tasks').select();
        res.json(tasks);
    } catch (error) {
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
        res.status(500).json({ error: 'Failed to fetch task' });
    }
});

app.post('/tasks', async (req, res) => {
    const { title, description, priority, dueDate, status } = req.body;
    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }
    try {
        await knex('tasks').insert({
            title,
            description: description || '', // Default value if description is not provided
            priority: priority || 'medium', // Default value if priority is not provided
            due_date: dueDate || new Date().toISOString().split('T')[0], // Default value to current date
            status: status || 'pending' // Default value if status is not provided
        });
        res.status(201).json({ message: 'Task created' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, dueDate, status } = req.body;
    try {
        await knex('tasks').where({ id }).update({
            title,
            description: description || '',
            priority: priority || 'medium',
            due_date: dueDate || new Date().toISOString().split('T')[0],
            status: status || 'pending'
        });
        res.json({ message: 'Task updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await knex('tasks').where({ id }).del();
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});