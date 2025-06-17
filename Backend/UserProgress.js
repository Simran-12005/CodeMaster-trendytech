const userProgressSchema = new mongoose.Schema({
  username: String,
  solvedQuestions: [String]  // store question IDs or full question text
});

const UserProgress = mongoose.model('UserProgress', userProgressSchema);
