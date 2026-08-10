const axios = require("axios");
const config = require("../config/whatsapp.config");

function ensureConfiguration() {
    const required = {
        WHATSAPP_API_VERSION: config.apiVersion,
        PHONE_NUMBER_ID: config.phoneNumberId,
        WHATSAPP_ACCESS_TOKEN: config.accessToken
    };

    const missing = Object.entries(required)
        .filter(([, value]) => !value || !String(value).trim())
        .map(([name]) => name);

    if (missing.length) {
        throw new Error(
            `WhatsApp configuration missing: ${missing.join(", ")}`
        );
    }
}


function normalizePhone(phone) {
    let value = String(phone || "").trim();

    // Remove spaces, -, (, ), etc.
    value = value.replace(/[^\d+]/g, "");

    // +919900886021
    if (value.startsWith("+")) {
        return value;
    }

    // 919900886021
    if (value.startsWith("91") && value.length === 12) {
        return `+${value}`;
    }

    // 9900886021
    if (value.length === 10) {
        return `+91${value}`;
    }

    throw new Error(`Invalid Indian phone number: ${phone}`);
}


function messageEndpoint() {
    ensureConfiguration();

    const rawVersion = String(config.apiVersion).trim();

    const apiVersion = rawVersion.startsWith("v")
        ? rawVersion
        : `v${rawVersion}`;

    return `https://graph.facebook.com/${apiVersion}/${String(
        config.phoneNumberId
    ).trim()}/messages`;
}


function makeMetaError(error) {
    const status = error.response?.status;
    const metaError = error.response?.data?.error;

    const detail =
        metaError?.message ||
        error.message;

    const code =
        metaError?.code
            ? ` (code ${metaError.code})`
            : "";

    return new Error(
        `WhatsApp Cloud API error${
            status ? ` ${status}` : ""
        }${code}: ${detail}`
    );
}


async function sendPayload(payload) {
    try {
        const response = await axios.post(
            messageEndpoint(),
            payload,
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "WhatsApp Cloud API failure:",
            error.response?.data || error.message
        );

        throw makeMetaError(error);
    }
}


async function sendTextMessage(to, message) {

    const formattedPhone = normalizePhone(to);

    console.log(
        "📱 Sending text to:",
        formattedPhone
    );

    return sendPayload({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
            body: message
        }
    });
}


async function sendTemplateMessage(
    to,
    templateName,
    parameters = []
) {

    const formattedPhone = normalizePhone(to);

    console.log("📤 TEMPLATE REQUEST");

    console.log({
        to: formattedPhone,
        templateName,
        parameters
    });

    return sendPayload({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "template",

        template: {
            name: templateName,

            language: {
                code: "en_US"
            },

            components: [
                {
                    type: "body",

                    parameters: parameters.map(value => ({
                        type: "text",
                        text: String(value)
                    }))
                }
            ]
        }
    });
}


module.exports = {
    sendTextMessage,
    sendTemplateMessage
};
