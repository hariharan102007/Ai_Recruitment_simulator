import mongoose from 'mongoose';

const UserProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessmentId: mongoose.Schema.Types.ObjectId,
    assessmentType: {
      type: String,
      enum: ['aptitude', 'coding', 'interview'],
    },
    score: Number,
    totalQuestions: Number,
    correctAnswers: Number,
    timeSpent: Number, // in seconds
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        userAnswer: String,
        isCorrect: Boolean,
      },
    ],
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'not-started'],
      default: 'not-started',
    },
  },
  { timestamps: true }
);

export default mongoose.model('UserProgress', UserProgressSchema);
