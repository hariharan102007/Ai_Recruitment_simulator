import UserProgress from '../models/UserProgress.js';

export const submitAptitudeTest = async (req, res, next) => {
  try {
    const { assessmentId, score, totalQuestions, correctAnswers, timeSpent, answers } = req.body;

    const userProgress = new UserProgress({
      userId: req.user.id,
      assessmentId,
      assessmentType: 'aptitude',
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      answers,
      status: 'completed',
    });

    await userProgress.save();

    res.status(201).json({
      success: true,
      message: 'Test submitted successfully',
      result: userProgress,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserProgress = async (req, res, next) => {
  try {
    const { assessmentType, assessmentId } = req.query;
    let filter = { userId: req.user.id };

    if (assessmentType) filter.assessmentType = assessmentType;
    if (assessmentId) filter.assessmentId = assessmentId;

    const progress = await UserProgress.find(filter).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: progress.length,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (req, res, next) => {
  try {
    const stats = await UserProgress.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: '$assessmentType',
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          totalTimeSpent: { $sum: '$timeSpent' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaderboard = async (req, res, next) => {
  try {
    const { assessmentType, limit = 10 } = req.query;
    let match = {};

    if (assessmentType) match.assessmentType = assessmentType;

    const leaderboard = await UserProgress.aggregate([
      { $match: { ...match, status: 'completed' } },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: leaderboard.length,
      leaderboard,
    });
  } catch (error) {
    next(error);
  }
};
