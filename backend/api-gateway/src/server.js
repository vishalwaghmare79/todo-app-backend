import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import { request } from './utils/request.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
const TODO_SERVICE_URL = process.env.TODO_SERVICE_URL || 'http://localhost:4002';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors());
app.use(express.json());

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing token' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.post('/api/auth/register', async (req, res) => {
  const response = await request({
    method: 'post',
    url: `${AUTH_SERVICE_URL}/auth/register`,
    data: req.body
  });

  res.status(response.status).json(response.data);
});

app.post('/api/auth/login', async (req, res) => {
  const response = await request({
    method: 'post',
    url: `${AUTH_SERVICE_URL}/auth/login`,
    data: req.body
  });

  res.status(response.status).json(response.data);
});

app.get('/api/todos', requireAuth, async (req, res) => {
  const response = await request({
    method: 'get',
    url: `${TODO_SERVICE_URL}/todos`,
    headers: { 'x-user-id': req.user.id }
  });

  res.status(response.status).json(response.data);
});

app.post('/api/todos', requireAuth, async (req, res) => {
  const response = await request({
    method: 'post',
    url: `${TODO_SERVICE_URL}/todos`,
    data: req.body,
    headers: { 'x-user-id': req.user.id }
  });

  res.status(response.status).json(response.data);
});

app.patch('/api/todos/:id', requireAuth, async (req, res) => {
  const response = await request({
    method: 'patch',
    url: `${TODO_SERVICE_URL}/todos/${req.params.id}`,
    data: req.body,
    headers: { 'x-user-id': req.user.id }
  });

  res.status(response.status).json(response.data);
});

app.delete('/api/todos/:id', requireAuth, async (req, res) => {
  const response = await request({
    method: 'delete',
    url: `${TODO_SERVICE_URL}/todos/${req.params.id}`,
    headers: { 'x-user-id': req.user.id }
  });

  res.status(response.status).json(response.data);
});

app.listen(PORT, () => {
  console.log(`API gateway running on http://localhost:${PORT}`);
});
