import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { Todo } from './models/Todo.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4002;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hm-org';

app.use(cors());
app.use(express.json());

function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function requireUser(req, res, next) {
  const userId = req.header('x-user-id');

  if (!userId) {
    return res.status(401).json({ message: 'Missing user id' });
  }

  req.userId = userId;
  return next();
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'todo-service' });
});

app.get('/todos', requireUser, asyncHandler(async (req, res) => {
  const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(todos);
}));

app.post('/todos', requireUser, asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const todo = await Todo.create({ userId: req.userId, title });
  return res.status(201).json(todo);
}));

app.patch('/todos/:id', requireUser, asyncHandler(async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    {
      $set: {
        ...(req.body.title !== undefined ? { title: req.body.title } : {}),
        ...(req.body.completed !== undefined ? { completed: req.body.completed } : {})
      }
    },
    { new: true }
  );

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  return res.json(todo);
}));

app.delete('/todos/:id', requireUser, asyncHandler(async (req, res) => {
  const todo = await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  return res.json({ message: 'Todo deleted' });
}));

app.use((error, _req, res, _next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid todo id' });
  }

  console.error(error);
  return res.status(500).json({ message: 'Server error' });
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Todo service running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  });
