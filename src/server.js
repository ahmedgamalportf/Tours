require('dotenv').config();

const requiredEnvVars = ['PORT', 'MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const express = require('express');
const app = express();
const PORT = process.env.PORT
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')
const hotelRoutes = require('./routes/hotelRoutes')
const roomRoutes = require('./routes/roomRoutes')



connectDB();


app.use(cors());
app.use(express.json());
app.use('/api/v1/auth',authRoutes);
app.use('/api/v1/hotels',hotelRoutes);
app.use('/api/v1/rooms',roomRoutes);


app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT,()=>{
    console.log(`app is working on http://localhost:${PORT}`);
})

