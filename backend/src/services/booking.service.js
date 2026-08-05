const {
    sendTextMessage,
    sendTemplateMessage
} = require("./whatsapp.service");

const processBooking = async (booking) => {

    const ownerMessage = `
🟢 BOOKING CONFIRMED

Customer: ${booking.name}

Phone: ${booking.phone}

Brand: ${booking.brand}

Model: ${booking.model}

Issue:
${booking.issue}

Service:
${booking.serviceType || "Not Selected"}

Status:
Booking Confirmed
`;

    // Send owner notification
    await sendTextMessage(
        process.env.OWNER_PHONE,
        ownerMessage
    );

    // Prepare customer details
    const deviceName = `${booking.brand} ${booking.model}`.trim();

    const customerPhone = booking.phone.startsWith("91")
        ? booking.phone
        : `91${booking.phone}`;

    console.log("Sending booking template to:", customerPhone);

    // Send customer confirmation
    await sendTemplateMessage(
        customerPhone,
        "booking_confirmed",
        [
            booking.name,
            deviceName
        ]
    );

    return {
        success: true
    };
};

module.exports = {
    processBooking
};