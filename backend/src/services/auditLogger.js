/**
 * SchemeSetu Centralized Security & Operational Audit Logger
 * Tracks system events without exposing passwords, credentials, or confidential document bodies.
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.resolve(__dirname, '../../../logs');
const AUDIT_LOG_FILE = path.join(LOGS_DIR, 'audit_events.jsonl');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// In-memory ring buffer for recent audit events
const inMemoryAuditEvents = [];
const MAX_IN_MEMORY = 100;

// Preload events from file if exists
try {
  if (fs.existsSync(AUDIT_LOG_FILE)) {
    const lines = fs.readFileSync(AUDIT_LOG_FILE, 'utf8').trim().split('\n');
    lines.forEach(l => {
      if (l.trim()) {
        try {
          inMemoryAuditEvents.push(JSON.parse(l.trim()));
        } catch (e) {}
      }
    });
  }
} catch (err) {}

// If still empty, initialize with default operational audit event
if (inMemoryAuditEvents.length === 0) {
  inMemoryAuditEvents.push({
    id: `AUD-INIT-${Date.now()}`,
    eventType: 'SYSTEM_STARTUP',
    userId: 'system',
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
    details: { service: 'SchemeSetu Platform', status: 'READY' }
  });
}

/**
 * Sanitize event payload to remove sensitive fields
 */
function sanitizePayload(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = { ...payload };
  const sensitiveKeys = ['password', 'confirmPassword', 'token', 'jwt', 'secret', 'apiKey', 'authorization'];
  
  sensitiveKeys.forEach(k => {
    if (clone[k]) clone[k] = '[MASKED_CREDENTIAL]';
  });

  return clone;
}

/**
 * Record an audit event
 */
function logAuditEvent(eventType, userId, details = {}, ip = '127.0.0.1') {
  const event = {
    id: `AUD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
    eventType,
    userId: userId || 'anonymous',
    ip,
    timestamp: new Date().toISOString(),
    details: sanitizePayload(details)
  };

  inMemoryAuditEvents.unshift(event);
  if (inMemoryAuditEvents.length > MAX_IN_MEMORY) {
    inMemoryAuditEvents.pop();
  }

  try {
    fs.appendFileSync(AUDIT_LOG_FILE, JSON.stringify(event) + '\n', 'utf8');
  } catch (err) {
    console.error("Failed to append audit log:", err);
  }

  return event;
}

/**
 * Get recent audit events with optional filter
 */
function getRecentAuditEvents(limit = 20, filterType = null) {
  let events = [...inMemoryAuditEvents];
  if (filterType) {
    events = events.filter(e => e.eventType === filterType);
  }
  return events.slice(0, limit);
}

module.exports = {
  logAuditEvent,
  getRecentAuditEvents,
  AUDIT_EVENT_TYPES: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    SCHEME_SEARCH: 'SCHEME_SEARCH',
    RECOMMENDATION: 'RECOMMENDATION',
    APPLICATION_CREATED: 'APPLICATION_CREATED',
    APPLICATION_UPDATED: 'APPLICATION_UPDATED',
    DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
    DOCUMENT_PROCESSED: 'DOCUMENT_PROCESSED',
    RAG_QUERY: 'RAG_QUERY',
    AGENT_EXECUTION: 'AGENT_EXECUTION',
    DELIVERABLE_GENERATED: 'DELIVERABLE_GENERATED'
  }
};
