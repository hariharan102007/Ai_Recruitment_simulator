import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithGoogle, logOutFirebase } from '@/firebase/firebase';
import { syncUserProfile } from '@/firebase/firestoreService';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const loginWithGoogleThunk = createAsyncThunk('auth/googleLogin', async (_, { rejectWithValue }) => {
  try {
    const firebaseUser = await signInWithGoogle();
    const token = await firebaseUser.getIdToken();
    const synced = await syncUserProfile({
      uid: firebaseUser.uid,
      displayName: firebaseUser.displayName || 'Candidate',
      email: firebaseUser.email || '',
    });

    const user = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Candidate',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || '',
      targetRole: synced?.targetRole || 'Full Stack Developer',
      experienceLevel: synced?.experienceLevel || 'Mid-Level',
      role: 'candidate',
    };

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error) {
    console.error('Google Auth Error:', error);
    return rejectWithValue(error.message || 'Google sign-in failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = {
      id: 'usr_' + btoa(email).slice(0, 10),
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role: 'candidate',
      experienceLevel: 'Mid-Level',
      targetRole: 'Full Stack Developer',
      targetCompany: 'Google',
    };
    const token = 'token_' + Date.now();
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error) {
    return rejectWithValue('Invalid credentials');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 600));
    const user = {
      id: 'usr_' + btoa(userData.email).slice(0, 10),
      ...userData,
      role: 'candidate',
    };
    const token = 'token_' + Date.now();
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    return { user, token };
  } catch (error) {
    return rejectWithValue('Registration failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      logOutFirebase().catch(() => {});
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(loginWithGoogleThunk.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginWithGoogleThunk.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user; state.token = action.payload.token; state.isAuthenticated = true; })
      .addCase(loginWithGoogleThunk.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout, clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
