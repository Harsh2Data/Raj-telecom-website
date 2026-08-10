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

    const message = `${buildOwnerLeadMessage(lead)}

Conversation code: ${conversation.code}

When the customer replies, use this code to reply from your WhatsApp.`;

    console.log("Customer phone:", lead.phone);
    console.log("Device:", `${lead.brand} ${lead.model}`);

    // ================================
    // SEND LEAD TO MULTIPLE OWNERS
    // ================================

    const ownerPhones = (process.env.OWNER_PHONES || "")
        .split(",")
        .map(phone => phone.trim())
        .filter(Boolean);

    console.log("Owner phones:", ownerPhones);

    for (const ownerPhone of ownerPhones) {

        try {

            await sendTextMessage(
                ownerPhone,
                message
            );

            console.log(
                `✅ Owner notification sent to ${ownerPhone}`
            );

        } catch (error) {

            console.error(
                `❌ Failed to notify owner ${ownerPhone}:`,
                error.message
            );
        }
    }

    // ================================
    // CUSTOMER PHONE
    // ================================

    const customerPhone = lead.phone.replace(/\D/g, "");

    const normalizedCustomerPhone =
        customerPhone.startsWith("91")
            ? customerPhone
            : `91${customerPhone}`;

    console.log(
        "Sending template to:",
        normalizedCustomerPhone
    );

    // ================================
    // SEND CUSTOMER CONFIRMATION
    // ================================

    try {

        const deviceName =
            `${lead.brand} ${lead.model}`.trim();

        await sendTemplateMessage(
            normalizedCustomerPhone,
            "lead_received",
            [
                lead.name,
                deviceName
            ]
        );

        console.log(
            "✅ Customer WhatsApp confirmation sent"
        );

    } catch (error) {

        console.error(
            "❌ Customer WhatsApp confirmation failed"
        );

        console.error(
            "Status:",
            error.response?.status
        );

        console.error(
            "Meta error:",
            JSON.stringify(
                error.response?.data,
                null,
                2
            )
        );
    }

    return {
        success: true
    };
};

module.exports = {
    createLead
};
