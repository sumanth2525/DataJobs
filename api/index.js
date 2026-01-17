// Vercel serverless function wrapper for Express app
// This allows the Express server to run as a serverless function on Vercel

const app = require('../backend/server');

module.exports = app;
