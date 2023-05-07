const express = require('express');
const router = express.Router();
const { toTitleCase } = require('../utils/stringUtils');

// GET route
router.get('/example', (req, res) => {
    const name = 'john doe';
    const titleCaseName = toTitleCase(name);
    console.log(titleCaseName);

    res.json({ message: 'This is an example of a GET request', name: titleCaseName });
});

// POST route
router.post('/example', (req, res) => {
    const { email, password } = req.body;
    res.json({ message: 'This is an example of a POST request' });
});

module.exports = router;