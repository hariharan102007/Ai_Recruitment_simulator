import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('recruitai_color_theme') || 'teal';
  }
  return 'teal';
};

const initialState = {
  sidebarOpen: true,
  theme: 'dark',
  colorTheme: getInitialTheme(),
  modalOpen: null,
  toastMessage: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setColorTheme: (state, action) => {
      state.colorTheme = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('recruitai_color_theme', action.payload);
        document.documentElement.setAttribute('data-color-theme', action.payload);
      }
    },
    openModal: (state, action) => {
      state.modalOpen = action.payload;
    },
    closeModal: (state) => {
      state.modalOpen = null;
    },
    setToast: (state, action) => {
      state.toastMessage = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleTheme, setColorTheme, openModal, closeModal, setToast } = uiSlice.actions;
export default uiSlice.reducer;
