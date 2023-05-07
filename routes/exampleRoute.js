/* eslint-disable no-unused-vars */
const express = require("express");
const router = express.Router();
const { toTitleCase } = require("../utils/stringUtils");
const helloController = require("../controllers/helloController");
const calculationService = require("../services/calculationService");

// GET route
router.get("/example", (req, res) => {
	const name = "john doe";
	const titleCaseName = toTitleCase(name);
	console.log(titleCaseName);

	res.json({ message: "This is an example of a GET request", name: titleCaseName });
});

// POST route
router.post("/example", (req, res) => {
	const { email, password } = req.body;
	res.json({ message: "This is an example of a POST request" });
});

// GET route with controller
router.get("/hello", helloController.sayHello);

// GET route with service
router.get("/calc", (req, res) => {
	const firstNumber = 12;
	const secondNumber = 9;
	const result = calculationService.addNumbers(firstNumber, secondNumber);
	res.json({ message: "This is an example of a GET request with service", firstNumber: firstNumber, secondNumber: secondNumber, result: result });
});

module.exports = router;