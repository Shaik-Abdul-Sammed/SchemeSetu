/**
 * Mock UPI Gateway & SMS Offline Gateway Service
 */
function processUpiPayment({ upiId, amount, serviceName }) {
  return {
    transactionId: `UPI2026${Date.now()}`,
    upiId,
    amount,
    serviceName,
    status: 'SUCCESS',
    timestamp: new Date().toISOString(),
    smsFallbackString: `SMS UPI PAYMENT SENT: *99*1*${upiId}*${amount}#`
  };
}

module.exports = {
  processUpiPayment
};
