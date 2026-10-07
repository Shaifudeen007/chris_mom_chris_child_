const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role, floor } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash: hashedPassword, role: role || 'USER', floor }
    });

    res.json({ success: true, message: 'Registered successfully', data: { id: user.id, email: user.email, floor: user.floor } });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Auto-register demo admin if it doesn't exist yet
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user && email === 'admin@example.com') {
      const hashedPassword = await bcrypt.hash('admin', 10);
      user = await prisma.user.create({
        data: { name: 'ADMIN', email, passwordHash: hashedPassword, role: 'ADMIN' }
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password securely
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1d' });
    res.json({ success: true, message: 'Logged in successfully', data: { access_token: token, refresh_token: 'mock-refresh' } });
  } catch (err) { next(err); }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { id: user.id, name: user.name, email: user.email, role: user.role, floor: user.floor } });
  } catch (err) { next(err); }
});

module.exports = router;
