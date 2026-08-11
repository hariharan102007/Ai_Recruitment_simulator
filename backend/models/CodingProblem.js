import mongoose from 'mongoose';

const CodingProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
    },
    description: String,
    problemStatement: String,
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    category: String,
    testCases: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    constraints: String,
    examples: [
      {
        input: String,
        output: String,
      },
    ],
    tags: [String],
    solution: String,
    acceptanceRate: Number,
    submissions: Number,
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

export default mongoose.model('CodingProblem', CodingProblemSchema);
