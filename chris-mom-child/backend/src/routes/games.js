const express = require('express');
const prisma = require('../utils/prisma');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.use(authMiddleware);

// Get my identities
router.get('/my-identities', async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find the active or revealed game
    const game = await prisma.game.findFirst({
      where: { status: { in: ['ACTIVE', 'REVEALED'] } },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!game) return res.json({ success: true, data: [] });

    const isRevealed = game.status === 'REVEALED';
    const identities = [];

    // Check if user is a Mom
    const momMatch = await prisma.match.findFirst({
      where: { gameId: game.id, momId: userId },
      include: { game: true }
    });

    if (momMatch) {
      // Find the child's actual user to get the name if revealed
      const childUser = await prisma.user.findUnique({ where: { id: momMatch.childId } });
      identities.push({
        role: 'MOM',
        secretCode: momMatch.secretCode,
        counterpartAlias: 'Secret Child',
        revealed: isRevealed,
        counterpart_name: isRevealed && childUser ? childUser.name : null
      });
    }

    // Check if user is a Child
    const childMatch = await prisma.match.findFirst({
      where: { gameId: game.id, childId: userId },
      include: { user: true } // includes Mom user
    });

    if (childMatch) {
      identities.push({
        role: 'CHILD',
        secretCode: childMatch.secretCode,
        counterpartAlias: 'Secret Mom',
        revealed: isRevealed,
        counterpart_name: isRevealed && childMatch.user ? childMatch.user.name : null
      });
    }

    res.json({ success: true, data: identities });
  } catch (err) { next(err); }
});

// Mom creates a task
router.post('/mom/tasks', async (req, res, next) => {
  try {
    const { title, description, points } = req.body;
    
    // Find the active game
    const game = await prisma.game.findFirst({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' }
    });

    if (!game) return res.status(400).json({ success: false, message: 'No active game found.' });

    // Find the mom's match to get the childId
    const match = await prisma.match.findFirst({
      where: { gameId: game.id, momId: req.user.id }
    });

    if (!match) return res.status(400).json({ success: false, message: 'You are not assigned as a Mom in the active game.' });

    const task = await prisma.mission.create({
      data: {
        title,
        description,
        points: parseInt(points) || 10,
        status: 'PENDING',
        gameId: game.id,
        momId: req.user.id,
        childId: match.childId
      }
    });
    res.json({ success: true, data: task, message: 'Mission created successfully!' });
  } catch (err) { next(err); }
});

// Mom gets her created tasks
router.get('/mom/tasks', async (req, res, next) => {
  try {
    const tasks = await prisma.mission.findMany({
      where: { momId: req.user.id }
    });
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

// Child gets their assigned approved tasks
router.get('/child/tasks', async (req, res, next) => {
  try {
    const tasks = await prisma.mission.findMany({
      where: { 
        childId: req.user.id,
        status: 'APPROVED'
      }
    });
    res.json({ success: true, data: tasks });
  } catch (err) { next(err); }
});

module.exports = router;
