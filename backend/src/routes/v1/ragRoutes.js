const express = require('express');
const router = express.Router();
const { queryKnowledgeBase, evaluateRagBenchmark, buildKnowledgeIndex } = require('../../services/ragService');

// GET /api/v1/rag/query?q=... - Semantic search with citation metadata
router.get('/query', (req, res) => {
  const query = req.query.q || req.query.query || '';
  const topK = parseInt(req.query.topK, 10) || 3;
  const result = queryKnowledgeBase(query, topK);
  return res.status(200).json(result);
});

// POST /api/v1/rag/query - Post body query
router.post('/query', (req, res) => {
  const query = req.body.query || req.body.q || '';
  const topK = parseInt(req.body.topK, 10) || 3;
  const result = queryKnowledgeBase(query, topK);
  return res.status(200).json(result);
});

// GET /api/v1/rag/evaluate - Run 30-query evaluation suite
router.get('/evaluate', (req, res) => {
  const evalResult = evaluateRagBenchmark();
  return res.status(200).json(evalResult);
});

// GET /api/v1/rag/status - Knowledge Base index statistics
router.get('/status', (req, res) => {
  const totalChunks = buildKnowledgeIndex();
  return res.status(200).json({
    status: 'READY',
    totalChunks,
    service: 'SchemeSetu Multi-Document RAG Knowledge Base'
  });
});

module.exports = router;
