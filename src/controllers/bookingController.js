const bookingServices = require('../services/bookingServices');

const getStatusCode = (error, fallbackStatusCode = 400) => error.statusCode || fallbackStatusCode;

const createBooking = async (req, res) => {
  try {
    const results = await bookingServices.createBooking(req.body, req.user._id);

    res.status(201).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(getStatusCode(error)).json({
      success: false,
      message: error.message,
    });
  }
};

const confirmBookingPayment = async (req, res) => {
  try {
    const results = await bookingServices.confirmBookingPayment(req.params.id);

    res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(getStatusCode(error)).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createBooking,
  confirmBookingPayment,
};
