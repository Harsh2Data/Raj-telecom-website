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
