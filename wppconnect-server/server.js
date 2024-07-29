require('dotenv').config(); // Carregar variáveis de ambiente

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 3000; // Default to port 3000 if not provided

// MongoDB connection setup
const dbUser = process.env.MONGODB_USER || 'defaultUser';
const dbPassword = process.env.MONGODB_PASSWORD || 'defaultPassword';
const dbHost = process.env.MONGODB_HOST || 'localhost';
const dbName = process.env.MONGODB_DATABASE || 'test';

const mongoUri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}?authSource=admin`;

console.log('Connecting to MongoDB with URI:', mongoUri);

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');

        // Start the Express server after MongoDB connection is successful
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err.message); // Improved error message
        process.exit(1); // Exit the process with an error code if connection fails
    });

// Middleware and other configurations for your application...
app.use(express.json()); // Middleware for parsing JSON

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Other API endpoints...

module.exports = app; // For testing purposes
