import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

const PasswordSchema = new mongoose.Schema({
  website: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  iconUrl: { type: String, required: false }
}, { timestamps: true });

const Password = mongoose.model("Password", PasswordSchema);

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
    const iconUrl = getFaviconUrl(req.body.websiteUrl);
    
    const item = await Password.create({
      website,
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

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`✅ API running on http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));