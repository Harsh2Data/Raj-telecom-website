// Approved WhatsApp templates available for the 24h-window fallback.
// Both currently take the same [customerName, device] body parameters —
// keep param order here in sync with how each template is written in Meta.
// To add a newly-approved template later, just add an entry here — no other
// code changes needed.
const TEMPLATES = [
  {
    name: 'booking_confirmed',
    label: 'Booking Confirmed',
    params: [
      { key: 'customerName', label: 'Customer name' },
      { key: 'device', label: 'Device' }
    ]
  },
  {
    name: 'lead_received',
    label: 'Lead Received / Booking Reminder',
    params: [
      { key: 'customerName', label: 'Customer name' },
      { key: 'device', label: 'Device' }
    ]
  }
];

function listTemplates() {
  return TEMPLATES;
}

function findTemplate(name) {
  return TEMPLATES.find((t) => t.name === name) || null;
}

module.exports = { listTemplates, findTemplate };
