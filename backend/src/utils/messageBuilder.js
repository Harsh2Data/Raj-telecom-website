const buildOwnerLeadMessage = (lead) => {
  const service = lead.serviceLabel ? `\nService: ${lead.serviceLabel}` : "";
  const slot = lead.slot ? `\nPreferred slot: ${lead.slot}` : "";
  const address = lead.address ? `\nAddress: ${lead.address}` : "";
  const note = lead.message ? `\nCustomer note: ${lead.message}` : "";

  return `New repair lead\n\nCustomer: ${lead.name}\nPhone: ${lead.phone}\nDevice: ${lead.brand} ${lead.model}\nIssue: ${lead.issue}${service}${slot}${address}${note}\n\nPlease contact the customer to confirm the repair.`;
};

module.exports = { buildOwnerLeadMessage };
