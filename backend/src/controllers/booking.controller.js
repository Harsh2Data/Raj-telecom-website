const {
    processBooking
} = require("../services/booking.service");

const confirmBooking = async (req, res) => {

    try {

        await processBooking(req.body);

        return res.status(200).json({

            success: true,

            message: "Booking confirmed successfully."

        });

    }

    catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};

module.exports = {
    confirmBooking
};