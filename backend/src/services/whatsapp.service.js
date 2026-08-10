const axios = require('axios');
const config = require('../config/whatsapp.config');

function ensureConfiguration() {
  const required = {
    WHATSAPP_API_VERSION: config.apiVersion,
    PHONE_NUMBER_ID: config.phoneNumberId,
    WHATSAPP_ACCESS_TOKEN: config.accessToken
  };
  const missing = Object.entries(required)
    .filter(([, value]) => !value || !String(value).trim())
    .map(([name]) => name);
  if (missing.length) throw new Error(`WhatsApp configuration missing: ${missing.join(', ')}`);
}

function messageEndpoint() {
  ensureConfiguration();
  const rawVersion = String(config.apiVersion).trim();
  const apiVersion = rawVersion.startsWith('v') ? rawVersion : `v${rawVersion}`;
  return `https://graph.facebook.com/${apiVersion}/${String(config.phoneNumberId).trim()}/messages`;
}

function makeMetaError(error) {
  const status = error.response?.status;
  const metaError = error.response?.data?.error;
  const detail = metaError?.message || error.message;
  const code = metaError?.code ? ` (code ${metaError.code})` : '';
  return new Error(`WhatsApp Cloud API error${status ? ` ${status}` : ''}${code}: ${detail}`);
}

async function sendPayload(payload) {
  try {
    const response = await axios.post(messageEndpoint(), payload, {
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('WhatsApp Cloud API failure:', error.response?.data || error.message);
    throw makeMetaError(error);
  }
}

async function sendTextMessage(to, message) {
  return sendPayload({
    messaging_product: 'whatsapp',
    to: String(to).replace(/\D/g, ''),
    type: 'text',
    text: { body: message }
  });
}

const sendTemplateMessage = async (
    to,
    templateName,
    parameters = []
) => {

    try {

        const response = await axios.post(
            `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",

                to: to,

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
            },
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Template Message Sent");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.error("❌ Meta Error:");
        console.log(error.response?.status);
        console.log(error.response?.data || error.message);

        throw error;
    }
};
