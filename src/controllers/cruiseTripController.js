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


module.exports = {
    addCruiseTrip,
};