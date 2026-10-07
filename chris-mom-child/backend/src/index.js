require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const gamesRoutes = require('./routes/games');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Auto-seed an initial Game if none exists so the frontend Start Game works out of the box
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const gameCount = await prisma.game.count();
  if (gameCount === 0) {
    await prisma.game.create({
      data: {
        id: 1,
        name: 'Christmas 2026 Secret Match',
        description: 'Auto-seeded first game',
        status: 'PENDING'
      }
    });
    console.log('Seeded initial Game (ID: 1)');
  }
});
