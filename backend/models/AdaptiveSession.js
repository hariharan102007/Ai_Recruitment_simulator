import mongoose from 'mongoose';

const HistoryEntrySchema = new mongoose.Schema({
  questionText: { type: String },
  difficulty: { type: Number },
  score: { type: Number },
  correct: { type: Boolean },
  answeredAt: { type: Date, default: Date.now },
});

const AdaptiveSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  ability: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'finished'], default: 'active' },
  history: [HistoryEntrySchema],
  meta: { type: mongoose.Schema.Types.Mixed },
});

const AdaptiveSession = mongoose.models.AdaptiveSession || mongoose.model('AdaptiveSession', AdaptiveSessionSchema);

export default AdaptiveSession;
