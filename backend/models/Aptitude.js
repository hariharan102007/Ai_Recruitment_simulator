import mongoose from 'mongoose';

const AptitudeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    description: String,
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        explanation: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],
    category: String,
    duration: Number, // in minutes
    totalQuestions: Number,
    passingScore: Number,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Aptitude', AptitudeSchema);
