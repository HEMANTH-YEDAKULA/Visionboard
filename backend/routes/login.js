const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust path if needed

// --- Debug route ---
router.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'auth pong' });
});

// --- Login route ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Incoming login:', email);

    if (!email || !password) {
      return res.status(400).json({ msg: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ msg: 'Login successful', token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
