const express = require("express");

const router = express.Router();

const {
    confirmBooking
} = require("../controllers/booking.controller");

router.post("/confirm", confirmBooking);

module.exports = router;