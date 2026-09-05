/**
 * offlineStorage.js — IndexedDB Storage & Offline Voice Queue Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides client-side IndexedDB persistence for scheme catalog, partner data,
 * and queuing offline voice queries to sync automatically upon reconnection.
 */
'use strict';

const DB_NAME = 'schemesetu_db';
const DB_VERSION = 1;

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache');
        }
        if (!db.objectStoreNames.contains('voiceQueue')) {
          db.createObjectStore('voiceQueue', { autoIncrement: true });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

export async function saveOfflineCache(key, value) {
  try {
    const db = await getDB();
    const tx = db.transaction('cache', 'readwrite');
    tx.objectStore('cache').put(value, key);
    return true;
  } catch (err) {
    console.warn('IndexedDB saveCache error:', err);
    return false;
  }
}

export async function getOfflineCache(key) {
  try {
    const db = await getDB();
    const tx = db.transaction('cache', 'readonly');
    const req = tx.objectStore('cache').get(key);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

export async function queueOfflineVoiceQuery(queryText, timestamp = Date.now()) {
  try {
    const db = await getDB();
    const tx = db.transaction('voiceQueue', 'readwrite');
    tx.objectStore('voiceQueue').add({ queryText, timestamp });
    return true;
  } catch (err) {
    return false;
  }
}

export async function getQueuedVoiceQueries() {
  try {
    const db = await getDB();
    const tx = db.transaction('voiceQueue', 'readonly');
    const req = tx.objectStore('voiceQueue').getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (err) {
    return [];
  }
}
