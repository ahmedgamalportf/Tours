const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');


const register = async (userData) => {
  const { firstName, lastName, email, password, mobileNumber } = userData;

  if (!firstName || !lastName || !email || !password || !mobileNumber) {
    throw new Error('All fields are required');
  }

  if (typeof firstName !== 'string' || !firstName.trim()) {
    throw new Error('First name is required');
  }

  if (typeof lastName !== 'string' || !lastName.trim()) {
    throw new Error('Last name is required');
  }

  if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Email is required');
  }

  if (typeof password !== 'string' || !password.trim()) {
    throw new Error('Password is required');
  }

  if (typeof mobileNumber !== 'string' || !mobileNumber.trim()) {
    throw new Error('Mobile number is required');
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailExistance = await User.findOne({ email: normalizedEmail });

  if (emailExistance) {
    throw new Error('Email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    mobileNumber: mobileNumber.trim(),
  });

  return {
    message: 'User has been registered successfully',
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobileNumber: user.mobileNumber,
      role: user.role,
    },
  };
};

const login = async(userData)=>{

    const {email, password} = userData;

    if (!email || !password) {
    throw new Error('you have to enter email or password');
    }  

     if (typeof email !== 'string' || !email.trim()) {
    throw new Error('Email is required');
    }

    if (typeof password !== 'string' || !password.trim()) {
    throw new Error('Password is required');
    }
    const normalizedEmail = email.trim().toLowerCase();
    
    
    const user = await User.findOne({
        email:normalizedEmail
    }); 

    if(!user){
        throw new Error('invalid email or password');
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw new Error('invalid email or password');
    }

    const token = jwt.sign({
        userId:user._id,

    },
    process.env.JWT_SECRET,
    {
        expiresIn: '7d'
    })

    return {
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
  };
};


module.exports = { 
    register,
    login 
};