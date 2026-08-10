const leadService = require("../services/lead.service");

exports.createLead = async (req, res) => {

    try {

        await leadService.createLead(req.body);

        res.status(200).json({
            success: true,
            message: "Lead received successfully."
        });

    } catch (error) {

        console.error("Lead creation failed:", error.response?.data ? JSON.stringify(error.response.data) : error.stack);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};