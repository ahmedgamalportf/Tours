const roomServices = require('../services/roomServices');

const getStatusCode = (error, fallbackStatusCode = 400) => error.statusCode || fallbackStatusCode;


const addRoom = async (req, res) => {
  try {
    const hotelId = req.params.hotelId || req.body.hotelId || req.body.hotel;

    const results = await roomServices.addRoom(
      req.body,
      req.user._id,
      hotelId
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

const getRooms = async(req,res)=>{
    

    try {
    const results = await roomServices.getRooms(req.query);

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


const getRoomByIdForAdmin = async(req,res)=>{
    try {
        const results = await roomServices.getRoomByIdForAdmin(req.params.id);
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

const editRoom = async(req,res)=>{
    try {
        const results = await roomServices.editRoom(req.params.id, req.body);
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
}

const softDeleteRoom = async(req,res)=>{
    try {
        const results = await roomServices.softDeleteRoom(req.params.id);
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
}

const restoreRoom = async(req,res)=>{

    try {
        const results = await roomServices.restoreRoom(req.params.id);
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
}

const hardDeleteRoom = async (req, res) => {

    try {
        const results =  await roomServices.hardDeleteRoom(req.params.id);
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

}



module.exports = {
  addRoom,
  getRooms,
  getRoomById,
  getRoomByIdForAdmin,
  editRoom,
  softDeleteRoom,
  restoreRoom,
  hardDeleteRoom
};
