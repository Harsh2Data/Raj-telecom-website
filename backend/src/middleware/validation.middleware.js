const { validateLead } = require("../validators/lead.validator");

const validateLeadRequest = (req, res, next) => {

    const errors = validateLead(req.body);

    if (errors.length > 0) {

        return res.status(400).json({

            success: false,

            message: "Validation failed.",

            errors

        });

    }

    next();

};

module.exports = {
    validateLeadRequest
};