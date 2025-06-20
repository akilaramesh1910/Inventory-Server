const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require('morgan');
dotenv.config();

const app = express();

// const corsOptions = {
//   origin: 'http://localhost:3000/',
//   methods: ['GET', 'POST', 'PUT'],      
//   allowedHeaders: ['Content-Type', 'Authorization'] 
// };

// app.use(cors(corsOptions));

app.use(cors());
app.use(express.json());
app.use(morgan('dev')); 

if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in .env file. Application cannot start securely.");
    process.exit(1); 
}


mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log('MongoDB connected')
})
.catch(err => {
    console.log('MongoDB connection failed')
})

app.use('/api/auth', require('./routes/Auth'))
app.use('/api/products', require('./routes/Product'))
app.use('/api/stock', require('./routes/Stock')) 
app.use('/api/orders', require('./routes/Order'))
app.use('/api/barcodes', require('./routes/Barcode'))
app.use('/api/dashboard', require('./routes/Dashboard'))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`))