# Kitty小任务

Kitty小任务 is a task management web application built with HTML, CSS, and JavaScript, powered by Vite. It features task creation, editing, deletion, and focus mode. This project uses Express for the backend, PostgreSQL for the database, and Service Workers for offline support.

![Screenshot 1](public/img/img3.png)

## Environment Variables

Set up the following environment variables:

```plaintext
DATABASE_URL="postgres://neondb_owner:ntw6JxfrLWq0@ep-spring-wind-a5dygwfo.us-east-2.aws.neon.tech/neondb?sslmode=require&options=project%3Dep-spring-wind-a5dygwfo"
PGDATABASE="neondb"
PGHOST="ep-spring-wind-a5dygwfo.us-east-2.aws.neon.tech"
PGPORT="5432"
PGUSER="neondb_owner"
PGPASSWORD="ntw6JxfrLWq0"
```

## Project Structure

```plaintext
KittyTasks
├── .gitignore
├── node_modules
├── package.json
├── package-lock.json
├── public
│   ├── index.html
│   ├── legal
│   ├── manifest.json
│   ├── service-worker.js
│   └── style.css
├── README.md
├── server.js
└── .replit
```


![Screenshot 1](public/img/img2.png)


## Run and Build Scripts

In `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js"
  },
  "dependencies": {
    "body-parser": "^1.20.2",
    "express": "^4.19.2",
    "knex": "^3.1.0",
    "pg": "^8.12.0",
    "vite": "^5.0.12"
  }
}
```

- `dev`: Runs Vite development server.
- `build`: Builds the project.
- `preview`: Previews the built project.
- `start`: Starts the Express server.

## Configuration Files

### `.replit`

```toml
entrypoint = "public/index.html"
run = "node server.js"
hidden = [".config"]
modules = ["nodejs-18", "web"]
[nix]
channel = "stable-23_05"
[deployment]
deploymentTarget = "cloudrun"
run = ["sh", "-c", "node server.js"]
[[ports]]
localPort = 3001
externalPort = 3001
```

- Specifies entrypoint and run commands.
- Defines hidden files and modules.
- Configures deployment settings and ports.

### `replit.nix`

```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.postgresql
  ];
}
```

- Specifies dependencies using Nix package manager.

## Backend Server

### `server.js`

```javascript
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

// Routes for tasks operations (CRUD)
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
      description: description || '',
      priority: priority || 'medium',
      due_date: dueDate || new Date().toISOString().split('T')[0],
      status: status || 'pending'
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
```

## Frontend

### `public/index.html`

Main HTML structure of the application.

### `public/manifest.json`

```json
{
  "name": "Kitty小任务",
  "short_name": "Kitty任务",
  "start_url": "/index.html",
  "display": "standalone",
  "background_color": "#ffb6c1",
  "theme_color": "#ffb6c1",
  "icons": [
    {
      "src": "https://cdn-icons-png.flaticon.com/256/2632/2632839.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "https://cdn-icons-png.flaticon.com/256/2632/2632839.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

- Defines application metadata for PWA.

## Running the Project

1. **Install Dependencies**:

    ```bash
    npm install
    ```

2. **Start the Server**:

    ```bash
    npm start
    ```



   ![Screenshot 1](public/img/img1.png)
