/**
 * Mock Bank Appointment Scheduler API
 */
function bookAppointment({ partnerId, date, citizenName }) {
  return {
    appointmentId: `APT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    partnerId,
    bankBranch: 'State Bank of India - Lead MSME Branch',
    citizenName,
    scheduledDate: date,
    slotTime: '11:00 AM - 11:30 AM',
    helpdeskToken: `TOK-${Math.floor(100 + Math.random() * 900)}`
  };
}

module.exports = {
  bookAppointment
};
