const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectToDB = require('./config/db');
// const logger = require('./middleware/logger'); // Morgan but handmade

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectToDB();

// Import route files
const bootcamps = require('./routes/bootcamp');

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);

// app.get('/test', (req, res) => {
//   // res.send('<h1>HEHEHE</h1>');
//   // res.json({ name: 'mamang' });
//   // res.sendStatus(404);
//   res.status(200).json({ success: true, data: { id: 1 } });
// });

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode port on ${PORT}`)
);

// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit
  server.close(() => process.exit(1));
})