import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  SET_ERROR: 'SET_ERROR'
};

const initialState = {
  user: null,
  token: localStorage.getItem('chillar_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };

    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ─── Persist token & user ─────────────────────────────────────────
  const persistAuth = (token, user) => {
    localStorage.setItem('chillar_token', token);
    localStorage.setItem('chillar_user', JSON.stringify(user));
  };

  const clearAuth = () => {
    localStorage.removeItem('chillar_token');
    localStorage.removeItem('chillar_user');
  };

  // ─── Load user on mount ───────────────────────────────────────────
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('chillar_token');

      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }

      try {
        const data = await authService.getMe();
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: data.user, token }
        });
      } catch (error) {
        clearAuth();
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
      }
    };

    loadUser();
  }, []);

  // ─── Signup ───────────────────────────────────────────────────────
  const signup = useCallback(async (formData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await authService.signup(formData);
      persistAuth(data.token, data.user);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token }
      });
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.error(error.message || 'Signup failed');
      return { success: false, error: error.message };
    }
  }, []);

  // ─── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (formData) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await authService.login(formData);
      persistAuth(data.token, data.user);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: data.user, token: data.token }
      });
      toast.success(data.message);
      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    toast.success('Logged out successfully');
  }, []);

  // ─── Update user ──────────────────────────────────────────────────
  const updateUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
    const current = JSON.parse(localStorage.getItem('chillar_user') || '{}');
    localStorage.setItem('chillar_user', JSON.stringify({ ...current, ...userData }));
  }, []);

  const value = {
    ...state,
    signup,
    login,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};