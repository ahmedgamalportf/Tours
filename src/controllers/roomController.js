const roomServices = require('../services/roomServices');

const getStatusCode = (error, fallbackStatusCode = 400) => error.statusCode || fallbackStatusCode;


const addRoom = async (req, res) => {
  try {
    const results = await roomServices.addRoom(
      req.body,
      req.user._id,
      req.params.hotelId
    );

    res.status(201).json({
      success: true,
      ...results,
    });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

const getRoom = async(req,res)=>{
    

    try {
    const results = await roomServices.getRoom(req.query);

    res.status(201).json({
      success: true,
      ...results,
    });


    } catch (error) {
        return res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
    }
}

const getRoomById = async(req,res)=>{

    try {
        const results = await roomServices.getRoomById(req.params.id);
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
}


module.exports = {
  addRoom,
  getRoom,
  getRoomById,
};
