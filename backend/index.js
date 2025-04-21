const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 5000;
const tasksFile = path.join(__dirname, 'tasks.json');

// Middleware
app.use(cors());
app.use(express.json());

// Initialize tasks.json if it doesn't exist
async function initializeTasksFile() {
    try {
        await fs.access(tasksFile);
    } catch {
        await fs.writeFile(tasksFile, JSON.stringify([]));
    }
}
initializeTasksFile();

// GET: List all tasks
app.get('/tasks', async (req, res) => {
    try {
        const data = await fs.readFile(tasksFile);
        const tasks = JSON.parse(data);
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read tasks' });
    }
});

// POST: Create a new task
app.post('/tasks', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Task text is required' });
        }
        const data = await fs.readFile(tasksFile);
        const tasks = JSON.parse(data);
        const newTask = {
            id: tasks.length ? tasks[tasks.length - 1].id + 1 : 1,
            text,
            completed: false,
        };
        tasks.push(newTask);
        await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

// PUT: Update a task (toggle completion)
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(tasksFile);
        let tasks = JSON.parse(data);
        const task = tasks.find(t => t.id === parseInt(id));
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        task.completed = !task.completed;
        await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

// DELETE: Delete a task
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = await fs.readFile(tasksFile);
        let tasks = JSON.parse(data);
        const taskIndex = tasks.findIndex(t => t.id === parseInt(id));
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Task not found' });
        }
        tasks = tasks.filter(t => t.id !== parseInt(id));
        await fs.writeFile(tasksFile, JSON.stringify(tasks, null, 2));
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});