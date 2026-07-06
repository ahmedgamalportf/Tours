const hotelServices = require('../services/hotelServices');

const getStatusCode = (error, fallbackStatusCode = 400) => error.statusCode || fallbackStatusCode;

const addHotel = async (req, res) => {
  try {
    const results = await hotelServices.addHotel(req.body, req.user._id);

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

const gethotels = async(req,res) =>{

    try {
        const results = await hotelServices.gethotels(req.query);
        res.status(200).json({
            success:true,
            ...results,
        });

    } catch (error) {
        return res.status(getStatusCode(error)).json({
        success: false,
        message: error.message,
      });
    }

};

const gethotelsForadmin = async (req, res) => {
  try {
    const results = await hotelServices.gethotelsForadmin(req.query);

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


const getHotelById = async (req, res) => {
  try {
    const results = await hotelServices.getHotelById(req.params.id);

    res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 404)).json({
      success: false,
      message: error.message,
    });
  }
};

const getHotelByIdForAdmin = async (req, res) => {
  try {
    const results = await hotelServices.getHotelByIdForAdmin(req.params.id);

    res.status(200).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(getStatusCode(error, 404)).json({
      success: false,
      message: error.message,
    });
  }
};

const editHotel = async (req, res) => {
  try {
    const results = await hotelServices.editHotel(req.params.id, req.body);

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
const softDeleteHotel = async (req, res) => {
  try {
    const results = await hotelServices.softDeleteHotel(req.params.id);

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

const restoreHotel = async (req, res) => {
  try {
    const results = await hotelServices.restoreHotel(req.params.id);

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

const hardDeleteHotel = async (req, res) => {
  try {
    const results = await hotelServices.hardDeleteHotel(req.params.id);

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


const searchHotels = async (req, res) => {
  try {
    const results = await hotelServices.searchHotels(req.query);

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
  addHotel,
  gethotels,
  gethotelsForadmin,
  getHotelById,
  getHotelByIdForAdmin,
  editHotel,
  softDeleteHotel,
  restoreHotel,
  hardDeleteHotel,
  searchHotels,
};
