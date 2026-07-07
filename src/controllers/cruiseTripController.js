const cruiseTripeServices = require('../services/cruiseTripServices');

const getStatusCode = (error, fallbackStatusCode = 400) => error.statusCode || fallbackStatusCode;

const addCruiseTrip = async(req,res)=>{

    try {
        
        const results = await cruiseTripeServices.addCruiseTrip(req.body, req.user._id);
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

}

const getAllCruiseTrips = async(req,res)=>{

    try {
        
        const results = await cruiseTripeServices.getAllCruiseTrips(req.query);
        res.status(200).json({
            success: true,
            ...results,
        })

    } catch (error) {
        return res.status(getStatusCode(error)).json({
            success: false,
            message: error.message,
        });
    }
}

const getAllCruisesTripsById = async(req,res)=>{

    try {
        const results = await cruiseTripeServices.getAllCruisesTripsById(req.params.id);
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

const getAllCruiseTripsForAdmin = async(req,res)=>{
    try {
        const results = await cruiseTripeServices.getAllCruiseTripsForAdmin(req.query);
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

const getAllCruiseTripsForAdminById = async(req,res)=>{
    try {
        const results = await cruiseTripeServices.getAllCruiseTripsForAdminById(req.params.id);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error, 404)).json({
        success: false,
        message: error.message,
    });
    }
}

const editCruiseTrip = async(req,res)=>{
    try {
        const results = await cruiseTripeServices.editCruiseTrip(req.body, req.params.id);
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
}

const softDeleteCruiseTrip = async (req,res)=>{
  try {
    
    const results = await cruiseTripeServices.softDeleteCruiseTrip(req.params.id);
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

const restoreCruiseTrip = async (req,res)=>{
  try {
    
    const results = await cruiseTripeServices.restoreCruiseTrip(req.params.id);
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

const hardDeleteCruiseTrip = async (req,res)=>{
  try {
    
    const results = await cruiseTripeServices.hardDeleteCruiseTrip(req.params.id);
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

const searchCruiseTrips = async (req,res)=>{
  try {
    
    const results = await cruiseTripeServices.searchCruiseTrips(req.query);
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
    addCruiseTrip,
    getAllCruiseTrips,
    getAllCruisesTripsById,
    getAllCruiseTripsForAdmin,
    getAllCruiseTripsForAdminById,
    editCruiseTrip,
    softDeleteCruiseTrip,
    restoreCruiseTrip,
    hardDeleteCruiseTrip,
    searchCruiseTrips,
};
