require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes')



connectDB();


app.use(cors());
app.use(express.json());
app.use('/api/v1/auth',authRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.listen(PORT,()=>{
    console.log(`app is working on http://localhost:${PORT}`);
})

