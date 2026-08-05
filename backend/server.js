require("dotenv").config();


const app = require("./src/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

const bookingRoutes = require("./src/routes/booking.routes");

app.use("/api/booking", bookingRoutes);