/* eslint-disable no-undef */
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const exampleRoutes = require("./routes/exampleRoute");
const requestLogger = require("./middlewares/requestLogger");

// Create an instance of Express
const app = express();

// .env config
dotenv.config({ path: "./.env" });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

// Apply the requestLogger middleware to all requests
app.use(requestLogger);

// Routes
app.use("/", exampleRoutes);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});