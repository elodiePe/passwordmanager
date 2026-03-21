import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const allowedOrigins = [
  'https://elodiepe.github.io'
];

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients and same-origin requests without Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow local development ports (e.g. 5173, 5174, etc.).
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true
}));

app.use(express.json());

const PasswordSchema = new mongoose.Schema({
  website: { type: String, required: true },
  credentialLinkKey: { type: String, required: false, index: true },
  websiteUrl: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  iconUrl: { type: String, required: false }
}, { timestamps: true });

const Password = mongoose.model("Password", PasswordSchema);

const PasswordPageSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  managerMode: { type: String, required: true, default: 'unknown' },
  website: { type: String, required: false },
  accountId: { type: String, required: false },
  startedAtMs: { type: Number, required: true },
  endedAtMs: { type: Number, required: true },
  durationMs: { type: Number, required: true },
  durationSeconds: { type: Number, required: true },
  exitReason: { type: String, required: false }
}, { timestamps: true });

const PasswordPageSession = mongoose.model("PasswordPageSession", PasswordPageSessionSchema);

const CredentialCopyEventSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  managerMode: { type: String, required: true, default: 'unknown' },
  website: { type: String, required: false },
  credentialLinkKey: { type: String, required: false, index: true },
  accountId: { type: String, required: false },
  actionType: { type: String, required: true },
  challengeType: { type: String, required: false },
  challengeDurationSeconds: { type: Number, required: false },
  challengeAttempts: { type: Number, required: false },
  requestedAtMs: { type: Number, required: true },
  completedAtMs: { type: Number, required: true },
  durationMs: { type: Number, required: true },
  durationSeconds: { type: Number, required: true },
  outcome: { type: String, required: true, default: 'completed' }
}, { timestamps: true });

const CredentialCopyEvent = mongoose.model("CredentialCopyEvent", CredentialCopyEventSchema);

// Helper to extract website name from URL
function extractWebsiteName(url) {
  try {
    const hostname = new URL(url).hostname;
    // Remove www. and get domain name without extension
    return hostname.replace(/^www\./, '').split('.')[0];
  } catch {
    return 'Unknown';
  }
}

function normalizeLinkKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

// Helper to get favicon URL
function getFaviconUrl(websiteUrl) {
  if (!websiteUrl) return null;
  try {
    const url = new URL(websiteUrl);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`;
  } catch {
    return null;
  }
}

app.get("/api/passwords", async (req, res) => {
  try {
    const items = await Password.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all accounts for a specific website
app.get("/api/passwords/:website", async (req, res) => {
  try {
    const accounts = await Password.find({ 
      website: req.params.website 
    }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ID route (kept)
app.get("/api/passwords/:website/:accountId", async (req, res) => {
  try {
    const accounts = await Password.find({ 
      website: req.params.website,
      _id: req.params.accountId
    }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/passwords", async (req, res) => {
  try {
    const website = extractWebsiteName(req.body.websiteUrl);
    const credentialLinkKey = normalizeLinkKey(req.body.credentialLinkKey) || normalizeLinkKey(website);
    const iconUrl = getFaviconUrl(req.body.websiteUrl);
    
    const item = await Password.create({
      website,
      credentialLinkKey,
      websiteUrl: req.body.websiteUrl,
      username: req.body.username,
      password: req.body.password,
      iconUrl
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put("/api/passwords/:website/:accountId", async (req, res) => {
  try {
    const updates = {
      username: req.body.username,
      password: req.body.password,
      credentialLinkKey: normalizeLinkKey(req.body.credentialLinkKey)
    };

    if (!updates.credentialLinkKey) {
      delete updates.credentialLinkKey;
    }

    const updated = await Password.findOneAndUpdate(
      { _id: req.params.accountId, website: req.params.website },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/passwords/:website/:accountId", async (req, res) => {
  try {
    const deleted = await Password.findOneAndDelete({
      _id: req.params.accountId,
      website: req.params.website
    });

    if (!deleted) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/study/password-page-session', async (req, res) => {
  try {
    const sessionId = String(req.body.sessionId || '').trim();
    const managerMode = String(req.body.managerMode || 'unknown').trim() || 'unknown';
    const startedAtMs = Number(req.body.startedAtMs);
    const endedAtMs = Number(req.body.endedAtMs);

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    if (!Number.isFinite(startedAtMs) || !Number.isFinite(endedAtMs)) {
      return res.status(400).json({ error: 'startedAtMs and endedAtMs must be numbers' });
    }

    const durationMs = Math.max(0, endedAtMs - startedAtMs);
    const durationSeconds = durationMs / 1000;

    const created = await PasswordPageSession.create({
      sessionId,
      managerMode,
      website: req.body.website || null,
      accountId: req.body.accountId || null,
      startedAtMs,
      endedAtMs,
      durationMs,
      durationSeconds,
      exitReason: req.body.exitReason || null
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/study/password-page-session', async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId query param is required' });
    }

    const rows = await PasswordPageSession
      .find({ sessionId })
      .sort({ startedAtMs: 1 })
      .lean();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/study/credential-copy', async (req, res) => {
  try {
    const sessionId = String(req.body.sessionId || '').trim();
    const managerMode = String(req.body.managerMode || 'unknown').trim() || 'unknown';
    const actionType = String(req.body.actionType || '').trim();
    const requestedAtMs = Number(req.body.requestedAtMs);
    const completedAtMs = Number(req.body.completedAtMs);

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    if (!actionType) {
      return res.status(400).json({ error: 'actionType is required' });
    }

    if (!Number.isFinite(requestedAtMs) || !Number.isFinite(completedAtMs)) {
      return res.status(400).json({ error: 'requestedAtMs and completedAtMs must be numbers' });
    }

    const durationMs = Math.max(0, completedAtMs - requestedAtMs);
    const durationSeconds = durationMs / 1000;

    const created = await CredentialCopyEvent.create({
      sessionId,
      managerMode,
      website: req.body.website || null,
      credentialLinkKey: normalizeLinkKey(req.body.credentialLinkKey) || null,
      accountId: req.body.accountId || null,
      actionType,
      challengeType: req.body.challengeType || null,
      challengeDurationSeconds: Number.isFinite(Number(req.body.challengeDurationSeconds))
        ? Number(req.body.challengeDurationSeconds)
        : null,
      challengeAttempts: Number.isFinite(Number(req.body.challengeAttempts))
        ? Number(req.body.challengeAttempts)
        : null,
      requestedAtMs,
      completedAtMs,
      durationMs,
      durationSeconds,
      outcome: String(req.body.outcome || 'completed')
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/study/credential-copy', async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId query param is required' });
    }

    const rows = await CredentialCopyEvent
      .find({ sessionId })
      .sort({ requestedAtMs: 1 })
      .lean();

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/study/credential-copy', async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId query param is required' });
    }

    const result = await CredentialCopyEvent.deleteMany({ sessionId });

    res.json({ 
      message: `Deleted ${result.deletedCount} credential copy events for session ${sessionId}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/study/password-page-session', async (req, res) => {
  try {
    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId query param is required' });
    }

    const result = await PasswordPageSession.deleteMany({ sessionId });

    res.json({ 
      message: `Deleted ${result.deletedCount} password page sessions for session ${sessionId}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ API running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));