const path = require('path');
const express = require('express')
const dotenv = require('dotenv')
const morgan = require('morgan')
const connectToDB = require('./config/db')
const errorHandler = require('./middleware/error')
const fileupdload = require('express-fileupload')
const cookieParser = require('cookie-parser')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet');
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors')
const colors = require('colors');
// const logger = require('./middleware/logger'); // Morgan but handmade

// Load env vars
dotenv.config({ path: './config/config.env' });

// Connect to database
connectToDB();

// Import route files
const bootcamps = require('./routes/bootcamp');
const courses = require('./routes/courses');
const auth = require('./routes/auth');
const users = require('./routes/users')
const reviews = require('./routes/reviews')

const app = express();

// Body Parser
app.use(express.json())
// Cookie parser
app.use(cookieParser())

// Dev logging middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// File upload
app.use(fileupdload())

// Mongo Sanitize
app.use(mongoSanitize())
// Helmet security header
app.use(helmet())
// Prevent XSS attack
app.use(xss())
// Rate Limit express
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 mins
  max: 100
})
app.use(limiter)
// Header Parameter Pollution
app.use(hpp())
// Enable CORS
app.use(cors())

// Set static folder (accessable on web browser)
app.use(express.static(path.join(__dirname, 'public')))

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/auth/users', users)
app.use('/api/v1/reviews', reviews)

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode port on ${PORT}`.yellow.bold)
);
  
// Handle unhandled promise rejection
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit
  server.close(() => process.exit(1));
})
  


// app.get('/test', (req, res) => {
//   // res.send('<h1>HEHEHE</h1>');
//   // res.json({ name: 'mamang' });
//   // res.sendStatus(404);
//   res.status(200).json({ success: true, data: { id: 1 } });
// });

// TEST
// const hehe = require('./test');
// hehe()