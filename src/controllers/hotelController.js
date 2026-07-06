const hotelServices = require('../services/hotelServices');

const addHotel = async (req, res) => {
  try {
    const results = await hotelServices.addHotel(req.body, req.user._id);

    res.status(201).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const gethotels = async(req,res) =>{

    try {
        const results = await hotelServices.gethotels();
        res.status(200).json({
            success:true,
            ...results,
        });

    } catch (error) {
        return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

};


const gethotelsForadmin = async(req,res) =>{

    try {
        const results = await hotelServices.gethotels(req.user._id);
        res.status(200).json({
            success:true,
            ...results,
        });

    } catch (error) {
        return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

};

module.exports = {
  addHotel,
  gethotels,
  gethotelsForadmin,
};
