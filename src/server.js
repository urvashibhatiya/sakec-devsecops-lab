"use strict";

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allows inline styles and scripts for educational prototype
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Categories & Triage Weights
const CATEGORIES = {
  medical: { name: "Medical emergency", baseScore: 40 },
  fire: { name: "Fire / smoke", baseScore: 60 },
  security: { name: "Security threat", baseScore: 60 },
  accident: { name: "Accident / injury", baseScore: 35 },
  harass: { name: "Harassment / safety concern", baseScore: 40 },
  hazard: { name: "Natural hazard / flooding", baseScore: 45 },
  other: { name: "Other", baseScore: 15 }
};

const ZONES = [
  "Main Gate",
  "Admin Block",
  "Library",
  "Hostel A",
  "Hostel B",
  "Cafeteria",
  "Labs / Workshop",
  "Sports Ground",
  "Parking",
  "Auditorium"
];

const FLOW = ["New", "Acknowledged", "Dispatched", "On-scene", "Resolved"];

// State Store (In-memory for fast container deployment & portability)
let incidents = [];
let alerts = [];
let auditLogs = [];
let incidentSeq = 1;

// FNV-1a Hash for tamper-evident chain
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function calculateLink(prevHash, entry) {
  return fnv1a(`${prevHash}|${entry.timestamp}|${entry.actor}|${entry.action}|${entry.target}`);
}

function recordAudit(actor, action, target) {
  const prevHash = auditLogs.length ? auditLogs[auditLogs.length - 1].hash : "00000000";
  const entry = {
    timestamp: Date.now(),
    actor: actor || "SYSTEM",
    action,
    target: target || ""
  };
  entry.hash = calculateLink(prevHash, entry);
  auditLogs.push(entry);
  return entry;
}

// Priority & SLA Calculation
function getPriority(score) {
  if (score >= 80) return { level: "Critical", slaMinutes: 2 };
  if (score >= 60) return { level: "High", slaMinutes: 5 };
  if (score >= 40) return { level: "Medium", slaMinutes: 10 };
  return { level: "Low", slaMinutes: 30 };
}

function calculateScore(categoryKey, flags = {}) {
  const cat = CATEGORIES[categoryKey] || CATEGORIES.other;
  let score = cat.baseScore;
  if (flags.life) score += 45;
  if (flags.multi) score += 10;
  if (flags.ongoing) score += 20;
  return Math.min(100, score);
}

// Initialize seed demo data
recordAudit("SYSTEM", "SafeCampus System Initialized", "SYSTEM");

// ======================== API ROUTES ========================

// Health check endpoint for Docker HEALTHCHECK and AWS ELB / monitoring
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: "SafeCampus Emergency Response API",
    version: "1.0.0",
    sdgAlignment: "SDG 9: Industry, Innovation and Infrastructure"
  });
});

// List all incidents
app.get("/api/incidents", (req, res) => {
  const showAll = req.query.showAll === "true";
  const filtered = showAll ? incidents : incidents.filter(i => i.status !== "Resolved");
  res.json({
    success: true,
    count: filtered.length,
    data: filtered.sort((a, b) => b.score - a.score || a.createdAt - b.createdAt)
  });
});

// Create new incident (SOS / Report)
app.post("/api/incidents", (req, res) => {
  const { category, zone, description, flags, anonymous, reporter } = req.body;

  // Validation
  const errors = [];
  if (!CATEGORIES[category]) errors.push("Invalid incident category.");
  if (!ZONES.includes(zone)) errors.push("Invalid campus zone selected.");
  if (!description || description.trim().length < 5) errors.push("Description must be at least 5 characters.");

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const cleanDesc = description.trim().slice(0, 300);
  const cleanFlags = {
    life: Boolean(flags && flags.life),
    multi: Boolean(flags && flags.multi),
    ongoing: Boolean(flags && flags.ongoing)
  };
  const score = calculateScore(category, cleanFlags);
  const priority = getPriority(score);

  const incident = {
    id: `INC-${String(incidentSeq++).padStart(3, "0")}`,
    category,
    categoryName: CATEGORIES[category].name,
    zone,
    description: cleanDesc,
    flags: cleanFlags,
    score,
    priority: priority.level,
    slaMinutes: priority.slaMinutes,
    status: "New",
    team: "",
    createdAt: Date.now(),
    acknowledgedAt: 0,
    resolvedAt: 0,
    escalatedTo112: false,
    reporter: anonymous ? "Anonymous" : (reporter && reporter.trim().slice(0, 60)) || "Not provided"
  };

  incidents.push(incident);
  recordAudit(incident.reporter, `CREATE ${incident.id} [${priority.level} - Score: ${score}]`, incident.id);

  res.status(201).json({
    success: true,
    message: "Incident reported successfully. Emergency response alert dispatched.",
    data: incident
  });
});

// Advance incident status
app.put("/api/incidents/:id/status", (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, error: "Incident not found." });
  }

  const currentIndex = FLOW.indexOf(incident.status);
  if (currentIndex === -1 || currentIndex >= FLOW.length - 1) {
    return res.status(400).json({ success: false, error: "Incident is already resolved." });
  }

  const nextStatus = FLOW[currentIndex + 1];

  // Business rule: team must be assigned before dispatch
  if (nextStatus === "Dispatched" && !incident.team) {
    return res.status(400).json({ success: false, error: "Must assign a response team before dispatching." });
  }

  incident.status = nextStatus;
  const now = Date.now();
  if (nextStatus === "Acknowledged" && !incident.acknowledgedAt) incident.acknowledgedAt = now;
  if (nextStatus === "Resolved" && !incident.resolvedAt) incident.resolvedAt = now;

  const actor = req.body.actor || "Responder";
  recordAudit(actor, `STATUS_TRANSITION ${incident.id} -> ${nextStatus}`, incident.id);

  res.json({
    success: true,
    message: `Incident ${incident.id} status updated to ${nextStatus}`,
    data: incident
  });
});

// Assign team
app.put("/api/incidents/:id/assign", (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, error: "Incident not found." });
  }

  if (incident.status === "Resolved") {
    return res.status(400).json({ success: false, error: "Cannot reassign team for resolved incident." });
  }

  const { team, actor } = req.body;
  incident.team = team || "";
  recordAudit(actor || "Dispatcher", `TEAM_ASSIGN ${incident.id} -> ${team || "Unassigned"}`, incident.id);

  res.json({ success: true, data: incident });
});

// Escalate incident to 112 (simulated external emergency link)
app.post("/api/incidents/:id/escalate", (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, error: "Incident not found." });
  }

  incident.escalatedTo112 = true;
  const actor = req.body.actor || "Admin/Responder";
  recordAudit(actor, `ESCALATE_112 ${incident.id} (External Services Dispatched)`, incident.id);

  res.json({
    success: true,
    message: `Incident ${incident.id} escalated to national emergency services (112 simulation).`,
    data: incident
  });
});

// Broadcast alerts
app.get("/api/alerts", (req, res) => {
  res.json({ success: true, data: alerts });
});

app.post("/api/alerts", (req, res) => {
  const { level, message, actor } = req.body;
  if (!message || message.trim().length < 3) {
    return res.status(400).json({ success: false, error: "Alert message must be at least 3 characters." });
  }

  const alert = {
    id: Date.now(),
    level: ["info", "warning", "evacuate"].includes(level) ? level : "info",
    message: message.trim().slice(0, 200),
    timestamp: Date.now(),
    active: true
  };

  alerts.push(alert);
  recordAudit(actor || "Emergency Admin", `BROADCAST_ALERT [${alert.level.toUpperCase()}]: ${alert.message}`, "CAMPUS");

  res.status(201).json({ success: true, data: alert });
});

app.post("/api/alerts/clear", (req, res) => {
  alerts.forEach(a => { a.active = false; });
  recordAudit(req.body.actor || "Emergency Admin", "BROADCAST_CLEARED", "CAMPUS");
  res.json({ success: true, message: "Active emergency alerts cleared." });
});

// Audit trail with integrity verification
app.get("/api/audit", (req, res) => {
  let prevHash = "00000000";
  let brokenIndex = -1;

  for (let i = 0; i < auditLogs.length; i++) {
    const expected = calculateLink(prevHash, auditLogs[i]);
    if (auditLogs[i].hash !== expected) {
      brokenIndex = i;
      break;
    }
    prevHash = auditLogs[i].hash;
  }

  res.json({
    success: true,
    totalEntries: auditLogs.length,
    chainIntact: brokenIndex === -1,
    brokenIndex,
    logs: auditLogs.slice(-50).reverse()
  });
});

// Metrics & Analytics
app.get("/api/metrics", (req, res) => {
  const now = Date.now();
  const acked = incidents.filter(i => i.acknowledgedAt > 0);
  const mtta = acked.length
    ? acked.reduce((sum, i) => sum + (i.acknowledgedAt - i.createdAt), 0) / acked.length / 60000
    : 0;

  const breaches = incidents.filter(i => {
    const limit = i.slaMinutes * 60000;
    const elapsed = (i.acknowledgedAt || now) - i.createdAt;
    return elapsed > limit;
  }).length;

  res.json({
    success: true,
    totalIncidents: incidents.length,
    openIncidents: incidents.filter(i => i.status !== "Resolved").length,
    resolvedIncidents: incidents.filter(i => i.status === "Resolved").length,
    meanTimeToAcknowledgeMinutes: Number(mtta.toFixed(2)),
    slaBreaches: breaches,
    activeAlerts: alerts.filter(a => a.active).length
  });
});

// Start server if not imported by Jest tests
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=======================================================`);
    console.log(` SafeCampus Emergency System (DevSecOps Prototype)    `);
    console.log(` SAKEC CIAP Microproject - Course: CSCOR1PC302        `);
    console.log(` Aligned with SDG 9: Industry, Innovation & Infra     `);
    console.log(` Server running on http://0.0.0.0:${PORT}             `);
    console.log(` Health Check: http://0.0.0.0:${PORT}/health          `);
    console.log(`=======================================================`);
  });
}

module.exports = app;
