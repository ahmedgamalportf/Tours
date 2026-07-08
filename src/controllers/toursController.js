const toursServices = require('../services/toursService');

const getStatusCode = (error, fallbackStatusCode = 400) => error.statusCode || fallbackStatusCode;


const addTours = async(req,res)=>{

    try {
        const results = await toursServices.addTours(req.body, req.user._id);
        res.status(201).json({
            success:true,
            ...results,
        });
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            success:false,
            message:error.message,
        });
    }
}

const getAllTours = async(req,res) =>{
    try {
        const results = await toursServices.getAllTours(req.query);
        res.status(200).json({
            success:true,
            ...results,
        });
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        });
    }
}

const getTourById = async(req,res) =>{
    try {
        const results = await toursServices.getTourById(req.params.id);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message: error.message,
            success: false,
        });
        
    }
}

const getAllToursForAdmin = async (req,res) =>{
    try {
        const results = await toursServices.getAllToursForAdmin(req.query);
        res.status(200).json({
            success: true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            success:false,
            message:error.message,
        })
    }
}

const getTourForAdminById = async(req,res) =>{
    try {
        const results = await toursServices.getTourForAdminById(req.params.id);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        });
    }
}

const editTour = async(req,res) =>{
    try {
        const results = await toursServices.editTour(req.params.id, req.body);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        })
        
    }
}

const softDeleteTour = async(req,res) =>{
    try {
        const results = await toursServices.softDeleteTour(req.params.id);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        })
    }
}

const restoreTour = async(req,res) =>{
    try {
        const results = await toursServices.restoreTour(req.params.id);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        })
    }
}

const hardDeleteTour = async(req,res) =>{
    try {
        const results = await toursServices.hardDeleteTour(req.params.id);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        })
    }
}

const searchTours = async(req,res) =>{
    try {
        const results = await toursServices.searchTours(req.query);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        })
    }
}

const adminSearchTours = async(req,res) =>{
    try {
        const results = await toursServices.adminSearchTours(req.query);
        res.status(200).json({
            success:true,
            ...results,
        })
    } catch (error) {
        return res.status(getStatusCode(error)).json({
            message:error.message,
            success:false,
        })
    }
}

module.exports = {
    addTours,
    getAllTours,
    getTourById,
    getAllToursForAdmin,
    getTourForAdminById,
    editTour,
    softDeleteTour,
    restoreTour,
    hardDeleteTour,
    searchTours,
    adminSearchTours,

}
