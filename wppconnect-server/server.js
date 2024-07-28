// const express = require('express');
// const mongoose = require('mongoose');
// const app = express();
// const port = process.env.PORT || 3000; // Define a porta padrão como 3000

// // MongoDB connection setup
// const dbUser = process.env.MONGODB_USER;
// const dbPassword = process.env.MONGODB_PASSWORD;
// const dbHost = process.env.MONGODB_HOST;
// const dbName = process.env.MONGODB_DATABASE;

// const mongoUri = `mongodb://${dbUser}:${dbPassword}@${dbHost}:27017/${dbName}?authSource=admin`;

// // Connect to MongoDB
// mongoose.connect(mongoUri)
//     .then(() => {
//         console.log('MongoDB connected');

//         // Start the Express server after MongoDB connection is successful
//         app.listen(port, () => {
//             console.log(`Server running on port ${port}`);
//         });
//     })
//     .catch(err => {
//         console.log('MongoDB connection error:', err);
//         process.exit(1); // Exit the process with an error code if connection fails
//     });

// // Middleware and other configurations for your application...
// app.use(express.json()); // Example middleware for parsing JSON

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).send('OK');
// });

// // Other API endpoints...

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something broke!');
// });
