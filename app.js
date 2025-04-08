const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes/api');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routing
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
// This is the main entry point for the application. It sets up the Express server, middleware, and routes.