const authServices = require('../services/authServices');

const register = async(req,res)=>{

    try {
        
        const results = await authServices.register(req.body);

        res.status(201).json({
            message: "success",
            ...results
        })

    } catch (error) {
        const statusCode = error.code === 11000 ? 409 : error.statusCode || 500;

        return res.status(statusCode).json({
        success: false,
        message: error.code === 11000 ? 'Email already exists' : error.message,
    });
    }

}

const login = async (req,res)=>{
    try {
        const results =  await authServices.login(req.body);
        res.status(200).json({
            message:"success",
            ...results
        })

    } catch (error) {
        return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
    });
    }
}



module.exports = {
    register,
    login
};
