import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateAIAptitudeQuestions } from '@/services/aiService';

const mockQuestions = {
  quantitative: [
    { id: 1, question: 'If a train travels 360 km in 4 hours, what is its speed in m/s?', options: ['25 m/s', '30 m/s', '20 m/s', '35 m/s'], correct: 0, difficulty: 'easy' },
    { id: 2, question: 'A sum of money doubles itself in 5 years at simple interest. What is the rate of interest?', options: ['10%', '15%', '20%', '25%'], correct: 2, difficulty: 'medium' },
    { id: 3, question: 'The ratio of boys to girls in a class is 3:5. If there are 40 students, how many boys are there?', options: ['12', '15', '18', '20'], correct: 1, difficulty: 'easy' },
    { id: 4, question: 'What is the compound interest on $10,000 at 10% per annum for 2 years?', options: ['$2,000', '$2,100', '$2,200', '$1,900'], correct: 1, difficulty: 'medium' },
    { id: 5, question: 'A pipe can fill a tank in 6 hours. Another pipe can empty it in 8 hours. If both are opened, how long to fill?', options: ['12 hrs', '24 hrs', '18 hrs', '48 hrs'], correct: 1, difficulty: 'hard' },
  ],
  logical: [
    { id: 6, question: 'Find the next number: 2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '38'], correct: 1, difficulty: 'easy' },
    { id: 7, question: 'If APPLE is coded as ELPPA, how is ORANGE coded?', options: ['EGNARO', 'EGNAOR', 'ORANGE', 'ENOGAR'], correct: 0, difficulty: 'easy' },
    { id: 8, question: 'Statement: All roses are flowers. Some flowers fade quickly. Conclusion: Some roses fade quickly.', options: ['Valid', 'Invalid', 'Cannot determine', 'Partially valid'], correct: 2, difficulty: 'medium' },
    { id: 9, question: 'In a row of 40 children, P is 13th from left. What is P\'s position from right?', options: ['27th', '28th', '26th', '29th'], correct: 1, difficulty: 'easy' },
    { id: 10, question: 'A is B\'s brother. C is D\'s father. E is B\'s mother. A and D are brothers. How is E related to C?', options: ['Sister', 'Wife', 'Niece', 'Daughter'], correct: 1, difficulty: 'hard' },
  ],
  verbal: [
    { id: 11, question: 'Choose the word most similar to "AUTONOMOUS": Independent, Automatic, Spontaneous, Voluntary', options: ['Independent', 'Automatic', 'Spontaneous', 'Voluntary'], correct: 0, difficulty: 'easy' },
    { id: 12, question: 'Fill in the blank: He was _____ by the beauty of the Taj Mahal.', options: ['mesmerized', 'criticized', 'terrorized', 'ostracized'], correct: 0, difficulty: 'easy' },
    { id: 13, question: 'Choose the antonym of "BENEVOLENT":', options: ['Malevolent', 'Generous', 'Kind', 'Charitable'], correct: 0, difficulty: 'easy' },
    { id: 14, question: 'Identify the correctly spelled word:', options: ['Accomodation', 'Accommodation', 'Acomodation', 'Acommodation'], correct: 1, difficulty: 'easy' },
    { id: 15, question: 'The idiom "Piece of cake" means:', options: ['A dessert', 'Something easy', 'A celebration', 'A small portion'], correct: 1, difficulty: 'easy' },
  ],
  dataInterpretation: [
    { id: 16, question: 'If sales increased by 20% from 2020 to 2021 and decreased by 10% from 2021 to 2022, what is the net change from 2020?', options: ['+10%', '+8%', '-2%', '+12%'], correct: 1, difficulty: 'medium' },
    { id: 17, question: 'A pie chart shows 30% for category A. If total is 500, what is category A value?', options: ['150', '120', '180', '200'], correct: 0, difficulty: 'easy' },
    { id: 18, question: 'Average of 5 numbers is 20. If one number is removed and average becomes 18, what was the removed number?', options: ['28', '26', '30', '24'], correct: 0, difficulty: 'medium' },
    { id: 19, question: 'In a bar chart, Company A revenue is 3x Company B. If B earns $2M, what\'s the difference?', options: ['$4M', '$6M', '$2M', '$8M'], correct: 0, difficulty: 'easy' },
    { id: 20, question: 'If a table shows population growing at 5% annually from 1000, what is it after 2 years?', options: ['1100', '1102.5', '1050', '1105'], correct: 1, difficulty: 'medium' },
  ],
};

const initialState = {
  selectedCategory: null,
  selectedDifficulty: 'medium',
  questions: [],
  currentQuestion: 0,
  answers: {},
  markedForReview: [],
  timeRemaining: 1800,
  isStarted: false,
  isSubmitted: false,
  result: null,
  loading: false,
};

export const fetchQuestions = createAsyncThunk('aptitude/fetchQuestions', async ({ category, difficulty }, { getState, rejectWithValue }) => {
  try {
    const state = getState();
    const atsScore = state.resume.atsScore || 75;
    const resumeText = state.resume.parsedText || '';
    
    const response = await generateAIAptitudeQuestions({ category, difficulty, atsScore, resumeText });
    return response.questions || [];
  } catch (error) {
    console.error('Error in fetchQuestions thunk:', error);
    return rejectWithValue('Failed to fetch AI questions');
  }
});

const aptitudeSlice = createSlice({
  name: 'aptitude',
  initialState,
  reducers: {
    setCategory: (state, action) => { state.selectedCategory = action.payload; },
    setDifficulty: (state, action) => { state.selectedDifficulty = action.payload; },
    setCurrentQuestion: (state, action) => { state.currentQuestion = action.payload; },
    setAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    toggleMarkForReview: (state, action) => {
      const qId = action.payload;
      if (state.markedForReview.includes(qId)) {
        state.markedForReview = state.markedForReview.filter(id => id !== qId);
      } else {
        state.markedForReview.push(qId);
      }
    },
    decrementTime: (state) => { state.timeRemaining = Math.max(0, state.timeRemaining - 1); },
    startTest: (state) => { state.isStarted = true; },
    submitTest: (state) => {
      state.isSubmitted = true;
      const totalQuestions = state.questions.length;
      let correct = 0;
      let incorrect = 0;
      state.questions.forEach(q => {
        if (state.answers[q.id] !== undefined) {
          if (state.answers[q.id] === q.correct) correct++;
          else incorrect++;
        }
      });
      state.result = {
        totalQuestions,
        answered: Object.keys(state.answers).length,
        correct,
        incorrect,
        unanswered: totalQuestions - Object.keys(state.answers).length,
        accuracy: totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0,
        score: Math.round((correct / totalQuestions) * 100),
        timeTaken: 1800 - state.timeRemaining,
      };
    },
    resetAptitude: (state) => {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestions.pending, (state) => { state.loading = true; })
      .addCase(fetchQuestions.fulfilled, (state, action) => { state.loading = false; state.questions = action.payload; })
      .addCase(fetchQuestions.rejected, (state) => { state.loading = false; });
  },
});

export const { setCategory, setDifficulty, setCurrentQuestion, setAnswer, toggleMarkForReview, decrementTime, startTest, submitTest, resetAptitude } = aptitudeSlice.actions;
export default aptitudeSlice.reducer;
