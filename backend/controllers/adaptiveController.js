import AdaptiveSession from '../models/AdaptiveSession.js';
import { generateQuestion, updateAbility } from '../services/adaptiveService.js';

async function startInterview(req, res, next) {
  try {
    const user = req.user?.id || req.body.userId || null;
    const session = new AdaptiveSession({ user, ability: 0 });
    const firstQ = generateQuestion(session.ability);
    session.meta = { lastQuestion: firstQ };
    await session.save();
    res.status(201).json({ sessionId: session._id, question: firstQ, ability: session.ability });
  } catch (err) {
    next(err);
  }
}

async function answerQuestion(req, res, next) {
  try {
    const { sessionId, questionText, questionDifficulty, score } = req.body;
    if (!sessionId) return res.status(400).json({ message: 'sessionId required' });

    const session = await AdaptiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.status === 'finished') return res.status(400).json({ message: 'Session already finished' });

    const normalizedScore = Math.max(0, Math.min(1, Number(score ?? 0)));
    const difficulty = typeof questionDifficulty === 'number' ? questionDifficulty : session.meta?.lastQuestion?.difficulty ?? 0;

    const correct = normalizedScore >= 0.7;

    session.history.push({ questionText, difficulty, score: normalizedScore, correct, answeredAt: new Date() });

    // Update ability
    session.ability = updateAbility(session.ability, difficulty, normalizedScore);

    // Decide stopping condition (example: 10 questions)
    if ((session.history?.length || 0) >= 10) {
      session.status = 'finished';
      session.endedAt = new Date();
      await session.save();
      return res.json({ finished: true, summary: session });
    }

    // Generate next question
    const nextQ = generateQuestion(session.ability);
    session.meta = { lastQuestion: nextQ };
    await session.save();

    res.json({ finished: false, nextQuestion: nextQ, ability: session.ability });
  } catch (err) {
    next(err);
  }
}

async function finishInterview(req, res, next) {
  try {
    const { sessionId } = req.body;
    const session = await AdaptiveSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    session.status = 'finished';
    session.endedAt = new Date();
    await session.save();
    res.json({ message: 'Session finished', session });
  } catch (err) {
    next(err);
  }
}

async function getSession(req, res, next) {
  try {
    const { id } = req.params;
    const session = await AdaptiveSession.findById(id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    next(err);
  }
}

export { startInterview, answerQuestion, finishInterview, getSession };
