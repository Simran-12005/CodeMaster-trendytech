const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  questionTitle: { type: String, required: true },
  language: { type: String, required: true },
  complexityScore: { type: Number, required: true },
  code: { type: String, required: true },
  testResults: { type: Object, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index for better query performance
submissionSchema.index({ username: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);