import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    description: String,
    company: String,
    position: String,
    questions: [
      {
        question: String,
        expectedAnswer: String,
        category: String,
        difficulty: {
          type: String,
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
        },
      },
    ],
    interviewType: {
      type: String,
      enum: ['technical', 'hr', 'behavioral'],
      default: 'technical',
    },
    duration: Number, // in minutes
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

export default mongoose.model('Interview', InterviewSchema);
