const {
    sendTextMessage,
    sendTemplateMessage
} = require("./whatsapp.service");

const { getOrCreateConversation, updateConversation } = require("./conversation.service");

const processBooking = async (booking) => {

    // Conversation tracking (admin panel) needs MongoDB. If it's down or not
    // configured yet, the booking must still go through — this stays best-effort.
    let conversation = null;
    try {
        conversation = await getOrCreateConversation(booking);
        await updateConversation(conversation.code, { stage: "booking_confirmed" });
    } catch (error) {
        console.error("Conversation tracking unavailable:", error.message);
    }

    const message = `🟢 BOOKING CONFIRMED

Customer: ${booking.name}
Phone: ${booking.phone}
Brand: ${booking.brand}
Model: ${booking.model}

Issue:
${booking.issue}

Service:
${booking.serviceLabel || booking.serviceType || "Not selected"}
${booking.address ? `\nAddress:\n${booking.address}\n` : ""}
Slot:
${booking.slot || "Not selected"}${conversation ? `\n\nConversation code: ${conversation.code}` : ""}`;

    // ================================
    // SEND BOOKING TO MULTIPLE OWNERS
    // ================================

    const ownerPhones = (process.env.OWNER_PHONES || "")
        .split(",")
        .map(phone => phone.trim())
        .filter(Boolean);

    for (const ownerPhone of ownerPhones) {
        try {
            await sendTextMessage(ownerPhone, message);
            console.log(`✅ Owner notification sent to ${ownerPhone}`);
        } catch (error) {
            console.error(`❌ Failed to notify owner ${ownerPhone}:`, error.message);
        }
    }

    // ================================
    // CUSTOMER CONFIRMATION
    // ================================

    const customerPhone = booking.phone.replace(/\D/g, "");
    const normalizedCustomerPhone = customerPhone.startsWith("91") ? customerPhone : `91${customerPhone}`;

    try {
        const deviceName = `${booking.brand} ${booking.model}`.trim();

        await sendTemplateMessage(
            normalizedCustomerPhone,
            "booking_confirmed",
            [booking.name, deviceName]
        );

        console.log("✅ Customer booking confirmation sent");

    } catch (error) {
        console.error("❌ Customer booking confirmation failed");
        console.error("Status:", error.response?.status);
        console.error("Meta error:", JSON.stringify(error.response?.data, null, 2));
    }

    return {
        success: true
    };
};

module.exports = {
    processBooking
};
