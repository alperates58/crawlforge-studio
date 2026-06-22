import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@crawlforge/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const botRunsQueue = new Queue('bot-runs', { connection: connection as any });

app.use(cors());
app.use(express.json());

// Serve storage directory
app.use('/storage', express.static('/app/storage'));

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

app.get('/api/bots/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const bot = await prisma.bot.findUnique({
      where: { id },
      include: { project: true }
    });
    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }
    res.json(bot);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bot' });
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

app.post('/api/bots/:id/run', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Create run record
    const run = await prisma.botRun.create({
      data: {
        botId: id,
        status: 'queued',
      }
    });

    // Add to BullMQ queue
    await botRunsQueue.add('run-bot', { runId: run.id });

    res.json(run);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start bot run' });
  }
});

app.get('/api/runs', authenticateToken, async (req, res) => {
  try {
    const runs = await prisma.botRun.findMany({
      orderBy: { createdAt: 'desc' },
      include: { bot: true },
      take: 50
    });
    res.json(runs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch runs' });
  }
});

app.get('/api/runs/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const run = await prisma.botRun.findUnique({
      where: { id },
      include: {
        bot: true,
        stepLogs: {
          orderBy: { stepIndex: 'asc' }
        }
      }
    });
    if (!run) return res.status(404).json({ error: 'Run not found' });
    res.json(run);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch run' });
  }
});

app.get('/api/datasets', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const skip = (page - 1) * pageSize;

    const { search, projectId, botId, status } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (botId) where.botId = botId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { sourceUrl: { contains: search as string, mode: 'insensitive' } },
        { dataJson: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [total, datasets] = await Promise.all([
      prisma.dataset.count({ where }),
      prisma.dataset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          project: { select: { name: true } },
          bot: { select: { name: true } }
        }
      })
    ]);

    res.json({ data: datasets, total, page, pageSize });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch datasets' });
  }
});

app.get('/api/datasets/export/csv', authenticateToken, async (req, res) => {
  try {
    const { search, projectId, botId, status } = req.query;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (botId) where.botId = botId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { sourceUrl: { contains: search as string, mode: 'insensitive' } },
        { dataJson: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    // Pass 1: Collect unique JSON keys
    const jsonKeys = new Set<string>();
    const BATCH_SIZE = 500;
    let skip = 0;
    
    while (true) {
      const batch = await prisma.dataset.findMany({
        where,
        select: { dataJson: true },
        skip,
        take: BATCH_SIZE,
        orderBy: { id: 'asc' }
      });
      if (batch.length === 0) break;
      
      for (const item of batch) {
        if (item.dataJson) {
          try {
            const parsed = JSON.parse(item.dataJson);
            Object.keys(parsed).forEach(k => jsonKeys.add(k));
          } catch(e) {}
        }
      }
      skip += BATCH_SIZE;
    }

    const jsonColumns = Array.from(jsonKeys);
    const fixedColumns = ['id', 'project', 'bot', 'run_id', 'source_url', 'status', 'created_at'];
    const allColumns = [...fixedColumns, ...jsonColumns];

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="datasets.csv"');
    
    // Write CSV Header
    res.write(allColumns.join(',') + '\n');
    
    // Pass 2: Stream actual rows
    skip = 0;
    while (true) {
      const batch = await prisma.dataset.findMany({
        where,
        include: {
          project: { select: { name: true } },
          bot: { select: { name: true } }
        },
        skip,
        take: BATCH_SIZE,
        orderBy: { id: 'asc' }
      });
      if (batch.length === 0) break;
      
      for (const item of batch) {
        let parsed: any = {};
        if (item.dataJson) {
          try {
            parsed = JSON.parse(item.dataJson);
          } catch(e) {}
        }

        const row = [];
        row.push(`"${item.id}"`);
        row.push(`"${item.project?.name || ''}"`);
        row.push(`"${item.bot?.name || ''}"`);
        row.push(`"${item.runId || ''}"`);
        row.push(`"${item.sourceUrl || ''}"`);
        row.push(`"${item.status}"`);
        row.push(`"${new Date(item.createdAt).toISOString()}"`);
        
        for (const col of jsonColumns) {
          let val = parsed[col];
          if (val === null || val === undefined) val = '';
          if (typeof val === 'object') val = JSON.stringify(val);
          val = String(val).replace(/"/g, '""');
          row.push(`"${val}"`);
        }
        
        res.write(row.join(',') + '\n');
      }
      skip += BATCH_SIZE;
    }
    
    res.end();
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Failed to export datasets' });
  }
});

app.get('/api/datasets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      include: {
        project: true,
        bot: true
      }
    });
    if (!dataset) return res.status(404).json({ error: 'Dataset not found' });
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dataset' });
  }
});

app.put('/api/datasets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { dataJson, status } = req.body;
    
    // Validate JSON if provided
    if (dataJson) {
      try {
        JSON.parse(dataJson);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON data' });
      }
    }

    const dataToUpdate: any = {};
    if (dataJson !== undefined) dataToUpdate.dataJson = dataJson;
    if (status) dataToUpdate.status = status;

    const dataset = await prisma.dataset.update({
      where: { id },
      data: dataToUpdate
    });
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update dataset' });
  }
});

app.post('/api/datasets/:id/approve', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await prisma.dataset.update({
      where: { id },
      data: { status: 'approved' }
    });
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve dataset' });
  }
});

app.post('/api/datasets/:id/reject', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const dataset = await prisma.dataset.update({
      where: { id },
      data: { status: 'rejected' }
    });
    res.json(dataset);
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject dataset' });
  }
});

// Document endpoints
app.get('/api/documents', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 50;
    const skip = (page - 1) * pageSize;

    const { search, mimeType } = req.query;

    const where: any = {};
    if (mimeType) where.mimeType = mimeType;
    if (search) {
      where.filename = { contains: search as string, mode: 'insensitive' };
    }

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          project: { select: { name: true } },
          dataset: { select: { id: true } }
        }
      })
    ]);

    // map localPath to downloadUrl
    const safeDocuments = documents.map(doc => {
      const { localPath, ...rest } = doc;
      const downloadUrl = localPath.replace('/app/storage', 'http://localhost:3001/storage');
      return { ...rest, downloadUrl };
    });

    res.json({ data: safeDocuments, total, page, pageSize });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

app.get('/api/documents/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        project: true,
        dataset: true
      }
    });
    
    if (!document) return res.status(404).json({ error: 'Document not found' });
    
    // map localPath to downloadUrl
    const { localPath, ...safeDocument } = document;
    const downloadUrl = localPath.replace('/app/storage', 'http://localhost:3001/storage');
    
    res.json({ ...safeDocument, downloadUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
