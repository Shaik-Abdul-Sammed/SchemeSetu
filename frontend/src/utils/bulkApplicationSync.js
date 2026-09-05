/**
 * bulkApplicationSync.js — Field Agent Bulk Offline Application Sync
 * ─────────────────────────────────────────────────────────────────────────────
 * Allows Gram Panchayat field agents to collect citizen applications offline in
 * remote villages and batch sync them to backend APIs upon network connection.
 */
'use strict';

const LOCAL_STORAGE_KEY = 'schemesetu_offline_applications_batch';

export function queueApplicationOffline(appData) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    const newEntry = {
      ...appData,
      localId: `OFFLINE-APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      queuedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    existing.push(newEntry);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(existing));
    return newEntry;
  } catch (err) {
    console.error('Failed to queue offline application:', err);
    return null;
  }
}

export function getQueuedOfflineApplications() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
  } catch (err) {
    return [];
  }
}

export function clearSyncedBatch() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}
