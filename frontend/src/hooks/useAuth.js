import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { loginUser, registerUser, loginWithGoogleThunk, logout } from '@/store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const login = useCallback((email, password) => {
    return dispatch(loginUser({ email, password }));
  }, [dispatch]);

  const loginWithGoogle = useCallback(() => {
    return dispatch(loginWithGoogleThunk());
  }, [dispatch]);

  const register = useCallback((userData) => {
    return dispatch(registerUser(userData));
  }, [dispatch]);

  const logoutUser = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  return { user, isAuthenticated, loading, error, login, loginWithGoogle, register, logout: logoutUser };
};
