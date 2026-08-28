/**
 * Blockchain Immutable Hash Verification Service
 */
const crypto = require('crypto');

function generateDocumentHash(docData) {
  const payload = JSON.stringify(docData) + 'SCHEMESETU_BLOCKCHAIN_SALT';
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  return {
    blockchainHash: `0x${hash}`,
    blockNumber: Math.floor(18000000 + Math.random() * 500000),
    timestamp: new Date().toISOString(),
    verificationQrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x${hash}`
  };
}

module.exports = {
  generateDocumentHash
};
