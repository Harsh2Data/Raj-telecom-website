const {
    sendTextMessage,
    sendTemplateMessage
} = require("./whatsapp.service");

const {
    buildOwnerLeadMessage
} = require("../utils/messageBuilder");
const { getOrCreateConversation } = require("./conversation.service");

const createLead = async (lead) => {

    const conversation = getOrCreateConversation(lead);
    const message = `${buildOwnerLeadMessage(lead)}\n\nConversation code: ${conversation.code}\nWhen the customer replies, use this code to reply from your WhatsApp.`;

    console.log("Customer phone:", lead.phone);
    console.log("Device:", `${lead.brand} ${lead.model}`);

    await sendTextMessage(
        process.env.OWNER_PHONE,
        message
    );

    const deviceName = `${lead.brand} ${lead.model}`.trim();

const customerPhone = lead.phone.replace(/\D/g, "");

const normalizedCustomerPhone = customerPhone.startsWith("91")
    ? customerPhone
    : `91${customerPhone}`;

console.log("Sending template to:", normalizedCustomerPhone);

try {
    await sendTemplateMessage(
        normalizedCustomerPhone,
        "lead_received",
        [
            lead.name,
            deviceName
        ]
    );

    console.log("✅ Customer WhatsApp confirmation sent");
} catch (error) {
    console.error("❌ Customer WhatsApp confirmation failed");
    console.error("Status:", error.response?.status);
    console.error(
        "Meta error:",
        JSON.stringify(error.response?.data, null, 2)
    );
}

    return {
        success: true
    };
};

module.exports = {
    createLead
};
