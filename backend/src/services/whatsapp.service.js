const axios = require("axios");
const config = require("../config/whatsapp.config");

// Send Normal Text Message
const sendTextMessage = async (to, message) => {
    try {

        const response = await axios.post(
            `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: {
                    body: message
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ Text Message Sent");
        console.log(response.data);

        return response.data;

    } catch (error) {

        console.error("❌ Text Message Error");
        console.error(error.response?.data || error.message);

        throw error;

    }
};

// Send Template Message
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
                        code: "en_us"
                    },

                    components: [
                        {
                            type: "body",

                            parameters: parameters.map(value => ({
                                type: "text",
                                text: value
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

    console.log(error.response?.data);

    throw error;

}

};

module.exports = {
    sendTextMessage,
    sendTemplateMessage
};
