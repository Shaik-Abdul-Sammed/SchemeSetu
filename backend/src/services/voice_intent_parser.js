/**
 * Voice Intent Parser (PRAGATI-Inspired NLU Engine)
 */
function parseVoiceIntent(transcript = '') {
  const text = transcript.toLowerCase();

  if (text.includes('status') || text.includes('application') || text.includes('track')) {
    return { intent: 'CHECK_STATUS', confidence: 0.95, targetPage: '/applications' };
  }

  if (text.includes('loan') || text.includes('money') || text.includes('business') || text.includes('farm')) {
    return { intent: 'DISCOVER_SCHEMES', confidence: 0.92, targetPage: '/results' };
  }

  if (text.includes('agent') || text.includes('vle') || text.includes('register')) {
    return { intent: 'AGENT_REGISTRATION', confidence: 0.90, targetPage: '/input' };
  }

  return { intent: 'GENERAL_QUERY', confidence: 0.85, targetPage: '/input' };
}

module.exports = {
  parseVoiceIntent
};
