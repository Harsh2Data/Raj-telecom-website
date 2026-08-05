const {
    sendTextMessage,
    sendTemplateMessage
} = require("./whatsapp.service");

const {
    buildOwnerLeadMessage
} = require("../utils/messageBuilder");

const createLead = async (lead) => {

    const message = buildOwnerLeadMessage(lead);

    console.log("Customer phone:", lead.phone);
    console.log("Device:", `${lead.brand} ${lead.model}`);

    await sendTextMessage(
        process.env.OWNER_PHONE,
        message
    );

    const deviceName = `${lead.brand} ${lead.model}`.trim();

    const customerPhone = lead.phone.startsWith("91")
        ? lead.phone
        : `91${lead.phone}`;

    console.log("Sending template to:", customerPhone);

    await sendTemplateMessage(
        customerPhone,
        "lead_received",
        [
            lead.name,
            deviceName
        ]
    );

    return {
        success: true
    };
};

module.exports = {
    createLead
};