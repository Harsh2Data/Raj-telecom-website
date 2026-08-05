const express = require("express");
const router = express.Router();

const { createLead } = require("../controllers/lead.controller");

const {
    validateLeadRequest
} = require("../middleware/validation.middleware");

router.post(
    "/lead",
    validateLeadRequest,
    createLead
);

module.exports = router;