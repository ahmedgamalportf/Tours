require('dotenv').config();

const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createAdmin = async () => {
  const {
    MONGO_URI,
    ADMIN_FIRST_NAME,
    ADMIN_LAST_NAME,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    ADMIN_MOBILE_NUMBER,
  } = process.env;

  if (!MONGO_URI) {
    throw new Error('MONGO_URI is required');
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required');
  }

  await mongoose.connect(MONGO_URI);

  const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await User.findOne({ email: normalizedEmail });

  if (existingAdmin) {
    console.log(`Admin already exists: ${normalizedEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    firstName: (ADMIN_FIRST_NAME || 'Admin').trim(),
    lastName: (ADMIN_LAST_NAME || 'User').trim(),
    email: normalizedEmail,
    password: hashedPassword,
    mobileNumber: (ADMIN_MOBILE_NUMBER || '+10000000000').trim(),
    role: 'admin',
  });

  console.log(`Admin created successfully: ${normalizedEmail}`);
};

createAdmin()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
