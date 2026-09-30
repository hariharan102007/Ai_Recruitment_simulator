import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { generateAICodingProblems, evaluateCodeWithAI } from '@/services/aiService';

const initialState = {
  problems: [],
  selectedProblem: null,
  language: 'javascript',
  code: '',
  output: '',
  testResults: [],
  isRunning: false,
  isSubmitted: false,
  submissionResult: null,
  timeComplexity: '',
  spaceComplexity: '',
  loading: false,
  error: null,
};

export const fetchCodingProblems = createAsyncThunk(
  'coding/fetchProblems',
  async ({ forceNew = false } = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const atsScore = state.resume.atsScore || 75;
      const targetRole = state.resume.targetRole || state.resume.atsReport?.targetRole || 'Full Stack Developer';
      const resumeText = state.resume.parsedText || '';

      const response = await generateAICodingProblems({ atsScore, targetRole, resumeText, forceNew });
      return response.problems || [];
    } catch (error) {
      console.error('Error fetching coding problems:', error);
      return rejectWithValue('Failed to fetch coding problems');
    }
  }
);

const parseInputValue = (input) => {
  if (typeof input !== 'string') return input;
  try {
    return JSON.parse(input);
  } catch {
    return input;
  }
};

const normalizeValue = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const areEqual = (a, b) => normalizeValue(a) === normalizeValue(b);

export const runCode = createAsyncThunk('coding/runCode', async ({ code, problem, language }, { rejectWithValue }) => {
  try {
    if (!code || !code.trim()) {
      return { output: 'No code provided. Please write your solution before running.', success: false };
    }

    if (language !== 'javascript') {
      return { output: 'Run is currently supported only for JavaScript in this demo. Use Submit to evaluate your code or switch to JavaScript.', success: false };
    }

    const testCases = problem?.testCases || [];
    if (!testCases.length) {
      return { output: 'No sample test cases are available for this problem.', success: false };
    }

    let solveFn;
    try {
      const wrapper = new Function(`${code}; return solve;`);
      solveFn = wrapper();
      if (typeof solveFn !== 'function') {
        throw new Error('Could not find a valid solve(input) function.');
      }
    } catch (error) {
      return { output: `Compilation error: ${error.message}`, success: false };
    }

    const results = [];
    let allPassed = true;

    for (let i = 0; i < testCases.length; i += 1) {
      const tc = testCases[i];
      const inputValue = parseInputValue(tc.input);
      const expectedValue = parseInputValue(tc.expected);
      let actualValue;

      try {
        actualValue = solveFn(inputValue);
      } catch (error) {
        results.push(`Test case ${i + 1}: Runtime error - ${error.message}`);
        allPassed = false;
        continue;
      }

      const passed = areEqual(actualValue, expectedValue);
      if (!passed) allPassed = false;
      results.push(`Test case ${i + 1}: ${passed ? 'Passed' : 'Failed'} - expected ${normalizeValue(expectedValue)}, got ${normalizeValue(actualValue)}`);
    }

    const summary = allPassed ? 'All sample tests passed!' : 'Some sample tests failed.';
    return { output: `${results.join('\n')}\n${summary}`, success: allPassed };
  } catch (error) {
    return rejectWithValue(error.message || 'Runtime error');
  }
});

export const submitCode = createAsyncThunk(
  'coding/submitCode',
  async ({ code, problem }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const language = state.coding.language;
      const result = await evaluateCodeWithAI(problem, code, language);
      return result;
    } catch (error) {
      console.error('Error in submitCode thunk:', error);
      return rejectWithValue(error.message || 'Submission failed');
    }
  }
);

const codingSlice = createSlice({
  name: 'coding',
  initialState,
  reducers: {
    selectProblem: (state, action) => {
      state.selectedProblem = action.payload;
      state.code = action.payload ? (action.payload.starterCode[state.language] || '') : '';
      state.testResults = [];
      state.submissionResult = null;
      state.isSubmitted = false;
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
      if (state.selectedProblem) {
        state.code = state.selectedProblem.starterCode[action.payload] || '';
      }
    },
    setCode: (state, action) => { state.code = action.payload; },
    resetCoding: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCodingProblems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCodingProblems.fulfilled, (state, action) => {
        state.loading = false;
        state.problems = action.payload;
      })
      .addCase(fetchCodingProblems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(runCode.pending, (state) => { state.isRunning = true; })
      .addCase(runCode.fulfilled, (state, action) => { state.isRunning = false; state.output = action.payload.output; })
      .addCase(runCode.rejected, (state, action) => { state.isRunning = false; state.output = action.payload; })
      .addCase(submitCode.pending, (state) => { state.isRunning = true; })
      .addCase(submitCode.fulfilled, (state, action) => {
        state.isRunning = false;
        state.isSubmitted = true;
        state.submissionResult = action.payload;
        state.testResults = action.payload.testResults || [];
        state.timeComplexity = action.payload.timeComplexity;
        state.spaceComplexity = action.payload.spaceComplexity;
      })
      .addCase(submitCode.rejected, (state, action) => { state.isRunning = false; state.output = action.payload; });
  },
});

export const { selectProblem, setLanguage, setCode, resetCoding } = codingSlice.actions;
export default codingSlice.reducer;
