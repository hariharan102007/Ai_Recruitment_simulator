import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeResumeWithAI, inferDomainAndSkills } from '@/services/aiService';
import { extractTextFromFile } from '@/utils/pdfParser';

const STORAGE_KEY = 'recruitment_sim_resume_state';

const loadPersistedState = () => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const data = JSON.parse(raw);
      return {
        file: data.file || null,
        uploading: false,
        uploadProgress: 0,
        parsedText: data.parsedText || null,
        parsedData: data.parsedData || null,
        atsScore: data.atsScore || null,
        atsReport: data.atsReport || null,
        targetRole: data.targetRole || 'Full Stack Developer',
        loading: false,
        error: null,
      };
    }
  } catch (err) {
    console.warn('Could not read resume state from storage:', err);
  }
  return {
    file: null,
    uploading: false,
    uploadProgress: 0,
    parsedText: null,
    parsedData: null,
    atsScore: null,
    atsReport: null,
    targetRole: 'Full Stack Developer',
    loading: false,
    error: null,
  };
};

const savePersistedState = (state) => {
  try {
    if (typeof window !== 'undefined') {
      const payload = {
        file: state.file ? { name: state.file.name, size: state.file.size, type: state.file.type } : null,
        parsedText: state.parsedText,
        parsedData: state.parsedData,
        atsScore: state.atsScore,
        atsReport: state.atsReport,
        targetRole: state.targetRole || state.atsReport?.targetRole || 'Full Stack Developer',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    }
  } catch (err) {
    console.warn('Could not save resume state to storage:', err);
  }
};

const initialState = loadPersistedState();

// Upload and extract text from resume
export const uploadResume = createAsyncThunk('resume/upload', async (file, { rejectWithValue }) => {
  try {
    const extractedText = await extractTextFromFile(file);
    
    if (!extractedText || extractedText.length < 50) {
      return rejectWithValue('Could not extract enough text from the file. Please try a different format.');
    }

    return {
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString(),
      extractedText: extractedText,
    };
  } catch (error) {
    return rejectWithValue(error.message || 'Upload failed');
  }
});

// Analyze resume with AI
export const analyzeResume = createAsyncThunk(
  'resume/analyze',
  async ({ targetRole }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const resumeText = state.resume.parsedText;

      if (!resumeText) {
        return rejectWithValue('No resume text found. Please upload a resume first.');
      }

      const role = targetRole || state.resume.targetRole || 'Full Stack Developer';
      const analysis = await analyzeResumeWithAI(resumeText, role);

      return analysis;
    } catch (error) {
      return rejectWithValue(error.message || 'Analysis failed');
    }
  }
);

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setFile: (state, action) => {
      state.file = action.payload;
      savePersistedState(state);
    },
    setTargetRole: (state, action) => {
      state.targetRole = action.payload;
      if (state.atsReport) {
        state.atsReport.targetRole = action.payload;
      }
      savePersistedState(state);
    },
    setManualResumeText: (state, action) => {
      state.parsedText = action.payload;
      state.file = { name: 'Pasted_Resume.txt', size: action.payload.length, type: 'text/plain' };
      savePersistedState(state);
    },
    clearResume: (state) => {
      state.file = null;
      state.parsedText = null;
      state.parsedData = null;
      state.atsScore = null;
      state.atsReport = null;
      state.error = null;
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.warn('Storage clear error:', e);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Upload Resume
      .addCase(uploadResume.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadResume.fulfilled, (state, action) => {
        state.uploading = false;
        state.file = action.payload;
        state.parsedText = action.payload.extractedText;
        savePersistedState(state);
      })
      .addCase(uploadResume.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Analyze Resume
      .addCase(analyzeResume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(analyzeResume.fulfilled, (state, action) => {
        state.loading = false;
        state.atsScore = action.payload.atsScore;
        state.atsReport = action.payload;
        if (action.payload.targetRole) {
          state.targetRole = action.payload.targetRole;
        }
        savePersistedState(state);
      })
      .addCase(analyzeResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFile, setTargetRole, setManualResumeText, clearResume, clearError } = resumeSlice.actions;
export default resumeSlice.reducer;
