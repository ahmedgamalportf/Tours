const bcrypt = require('bcrypt');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobileRegex = /^\+?\d{10,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,}$/;


const register = async (userData) => {
  const { firstName, lastName, email, password, mobileNumber } = userData;

  if (!firstName || !lastName || !email || !password || !mobileNumber) {
    throw createError('All fields are required', 400);
  }

  if (typeof firstName !== 'string' || !firstName.trim()) {
    throw createError('First name is required', 400);
  }

  if (typeof lastName !== 'string' || !lastName.trim()) {
    throw createError('Last name is required', 400);
  }

  if (typeof email !== 'string' || !email.trim()) {
    throw createError('Email is required', 400);
  }

  if (!emailRegex.test(email.trim())) {
    throw createError('Invalid email format', 400);
  }

  if (typeof password !== 'string' || !password.trim()) {
    throw createError('Password is required', 400);
  }

  if (!passwordRegex.test(password)) {
    throw createError(
      'Password must be at least 10 characters and include uppercase, lowercase, number, and special character',
      400
    );
  }

  if (typeof mobileNumber !== 'string' || !mobileNumber.trim()) {
    throw createError('Mobile number is required', 400);
  }

  if (!mobileRegex.test(mobileNumber.trim())) {
    throw createError('Mobile number must contain 10 to 15 digits and may start with +', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const emailExistance = await User.findOne({ email: normalizedEmail });

  if (emailExistance) {
    throw createError('Email already exists', 409);
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
    throw createError('you have to enter email or password', 400);
    }  

     if (typeof email !== 'string' || !email.trim()) {
    throw createError('Email is required', 400);
    }

    if (!emailRegex.test(email.trim())) {
    throw createError('Invalid email format', 400);
    }

    if (typeof password !== 'string' || !password.trim()) {
    throw createError('Password is required', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    
    
    const user = await User.findOne({
        email:normalizedEmail
    }); 

    if(!user){
        throw createError('invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        throw createError('invalid email or password', 401);
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
