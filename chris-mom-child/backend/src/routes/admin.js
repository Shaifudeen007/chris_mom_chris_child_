const express = require('express');
const prisma = require('../utils/prisma');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

// Get all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

// Get all matches
router.get('/matches', async (req, res, next) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        game: true,
        user: true // mom
      }
    });

    // Also fetch the children to map their names
    const childIds = matches.map(m => m.childId);
    const children = await prisma.user.findMany({
      where: { id: { in: childIds } }
    });
    
    const formatted = matches.map(m => {
      const child = children.find(c => c.id === m.childId);
      return {
        id: m.id,
        momName: m.user.name,
        childName: child ? child.name : `Unknown (ID: ${m.childId})`,
        gameName: m.game.name
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err) { next(err); }
});

// Get all tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await prisma.mission.findMany();
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// Approve a task
router.post('/tasks/:id/approve', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.mission.update({
      where: { id: taskId },
      data: { status: 'APPROVED' }
    });
    res.json({ success: true, data: task, message: 'Mission approved!' });
  } catch (err) { next(err); }
});

// Reject a task
router.post('/tasks/:id/reject', async (req, res, next) => {
  try {
    const taskId = parseInt(req.params.id);
    const task = await prisma.mission.update({
      where: { id: taskId },
      data: { status: 'REJECTED' }
    });
    res.json({ success: true, data: task, message: 'Mission rejected!' });
  } catch (err) { next(err); }
});

// Start Game
router.post('/games/:id/start', async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.id);
    
    // 1. Fetch all standard users
    const users = await prisma.user.findMany({
      where: { role: 'USER' }
    });

    if (users.length < 2) {
      return res.status(400).json({ success: false, message: 'Not enough users to start the game (minimum 2).' });
    }

    // 2. Shuffle users (Fisher-Yates)
    const shuffled = [...users];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // 3. Create ring assignments and save to DB in a transaction
    await prisma.$transaction(async (tx) => {
      // Clear old participants/matches for this game just in case
      await tx.match.deleteMany({ where: { gameId } });
      await tx.gameParticipant.deleteMany({ where: { gameId } });

      for (let i = 0; i < shuffled.length; i++) {
        const mom = shuffled[i];
        const child = shuffled[(i + 1) % shuffled.length]; // Next person is the child, wraps around to 0

        // Add Game Participants
        await tx.gameParticipant.create({ data: { gameId, userId: mom.id, role: 'MOM' } });
        await tx.gameParticipant.create({ data: { gameId, userId: child.id, role: 'CHILD' } });

        // Create Match
        const secretCode = `MCH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        await tx.match.create({
          data: {
            gameId,
            momId: mom.id,
            childId: child.id,
            secretCode
          }
        });
      }

      // 4. Update Game Status
      await tx.game.update({
        where: { id: gameId },
        data: { status: 'ACTIVE' }
      });
    });

    res.json({ success: true, message: 'Game has been started! Pairs generated successfully.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message, stack: err.stack }); }
});

// Reveal Identities
router.post('/games/:id/reveal', async (req, res, next) => {
  try {
    const gameId = parseInt(req.params.id);
    await prisma.game.update({
      where: { id: gameId },
      data: { status: 'REVEALED' }
    });
    res.json({ success: true, message: 'Identities Revealed!' });
  } catch (err) { next(err); }
});

module.exports = router;
