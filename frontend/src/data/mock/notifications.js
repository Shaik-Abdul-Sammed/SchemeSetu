/**
 * SchemeSetu Centralized Mock Dataset - Notifications
 * Prototype / Demo Dataset for SIH 2026
 */

export const MOCK_NOTIFICATIONS = [
  {
    id: 'notif-001',
    title: 'Application Approved! 🎉',
    message: 'Your application for Pradhan Mantri Kisan Samman Nidhi (APP-2026-8891) has been approved by the Lead Bank.',
    timestamp: '2 hours ago',
    read: false,
    type: 'success',
    link: '/applications'
  },
  {
    id: 'notif-002',
    title: 'New Matched Scheme Available',
    message: 'Based on your profile, you are eligible for the PM Vishwakarma Scheme with ₹15,000 free toolkit assistance.',
    timestamp: '1 day ago',
    read: false,
    type: 'info',
    link: '/schemes/scheme-008'
  },
  {
    id: 'notif-003',
    title: 'Document Action Needed',
    message: 'Please upload your Rural Area Certificate for PMEGP Application (APP-2026-9250) to expedite 35% subsidy sanction.',
    timestamp: '2 days ago',
    read: true,
    type: 'warning',
    link: '/applications'
  },
  {
    id: 'notif-004',
    title: 'Nearby Partner Bank Available',
    message: 'State Bank of India - MSME Branch (0.8 km away) has active loan sanction allocations for MUDRA applicants.',
    timestamp: '3 days ago',
    read: true,
    type: 'info',
    link: '/schemes'
  }
];

export default MOCK_NOTIFICATIONS;
