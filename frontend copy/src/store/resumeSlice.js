import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { analyzeResumeWithAI } from '@/services/aiService';
import { extractTextFromFile } from '@/utils/pdfParser';

const initialState = {
  file: null,
  uploading: false,
  uploadProgress: 0,
  parsedText: null,
  parsedData: null,
  atsScore: null,
  atsReport: null,
  loading: false,
  error: null,
};

// Upload and extract text from resume
export const uploadResume = createAsyncThunk('resume/upload', async (file, { rejectWithValue }) => {
  try {
    const extractedText = await extractTextFromFile(file);
    
    if (!extractedText || extractedText.length < 50) {
      return rejectWithValue('Could not extract enough text from the file. Please try a different format.');
    }

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadDate: new Date().toISOString(),
      extractedText: extractedText,
    };
  } catch (error) {
    return rejectWithValue(error.message || 'Upload failed');
  }
});

// Analyze resume with AI (uses mock fallback if AI not configured)
export const analyzeResume = createAsyncThunk(
  'resume/analyze',
  async ({ targetRole }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const resumeText = state.resume.parsedText;

      if (!resumeText) {
        return rejectWithValue('No resume text found. Please upload a resume first.');
      }

      // Call AI service (falls back to intelligent mock if not configured)
      const analysis = await analyzeResumeWithAI(resumeText, targetRole || 'Full Stack Developer');

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
    },
    clearResume: (state) => {
      state.file = null;
      state.parsedText = null;
      state.parsedData = null;
      state.atsScore = null;
      state.atsReport = null;
      state.error = null;
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
      })
      .addCase(analyzeResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setFile, clearResume, clearError } = resumeSlice.actions;
export default resumeSlice.reducer;
