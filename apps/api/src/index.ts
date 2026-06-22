import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@crawlforge/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.post('/api/projects', authenticateToken, async (req: any, res) => {
  try {
    const { name, description, targetDomain, category } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        targetDomain,
        category,
        createdBy: req.user.id
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, targetDomain, category, status } = req.body;
    const project = await prisma.project.update({
      where: { id },
      data: { name, description, targetDomain, category, status }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.get('/api/bots', authenticateToken, async (req, res) => {
  try {
    const bots = await prisma.bot.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: { project: true }
    });
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bots' });
  }
});

app.post('/api/bots', authenticateToken, async (req: any, res) => {
  try {
    const { projectId, name, description, startUrl, stepsJson } = req.body;
    const bot = await prisma.bot.create({
      data: {
        projectId,
        name,
        description,
        startUrl,
        stepsJson,
        createdBy: req.user.id
      }
    });
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create bot' });
  }
});

app.put('/api/bots/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startUrl, stepsJson, status } = req.body;
    const bot = await prisma.bot.update({
      where: { id },
      data: { name, description, startUrl, stepsJson, status }
    });
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update bot' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
