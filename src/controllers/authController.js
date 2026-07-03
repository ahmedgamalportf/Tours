const authServices = require('../services/authServices');

const register = async(req,res)=>{

    try {
        
        const results = await authServices.register(req.body);

        res.status(201).json({
            message: "success",
            ...results
        })

    } catch (error) {
        return res.status(400).json({
        success: false,
        message: error.message,
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
        return res.status(400).json({
        success: false,
        message: error.message,
    });
    }
}



module.exports = {
    register,
    login
};