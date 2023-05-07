const express = require('express');
const router = express.Router();

// GET route
router.get('/example', (req, res) => {
    res.json({ message: 'This is an example of a GET request' });
});

// POST route
router.post('/example', (req, res) => {
    const { email, password } = req.body;
    res.json({ message: 'This is an example of a POST request' });
});

module.exports = router;