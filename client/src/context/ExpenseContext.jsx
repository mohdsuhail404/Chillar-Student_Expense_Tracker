import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { expenseService } from '../services/expenseService';
import { getCurrentMonthYear } from '../utils/helpers';
import toast from 'react-hot-toast';

const ExpenseContext = createContext();

const EXPENSE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_EXPENSES: 'SET_EXPENSES',
  ADD_EXPENSE: 'ADD_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  SET_SUMMARY: 'SET_SUMMARY',
  SET_BUDGET: 'SET_BUDGET',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION'
};

const { month, year } = getCurrentMonthYear();

const initialState = {
  expenses: [],
  total: 0,
  totalPages: 1,
  currentPage: 1,
  isLoading: false,
  summary: null,
  yearlySummary: null,
  budget: null,
  filters: {
    month,
    year,
    category: '',
    search: '',
    paymentMethod: '',
    sortBy: 'date',
    sortOrder: 'desc'
  }
};

const expenseReducer = (state, action) => {
  switch (action.type) {
    case EXPENSE_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };

    case EXPENSE_ACTIONS.SET_EXPENSES:
      return {
        ...state,
        expenses: action.payload.expenses,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        currentPage: action.payload.currentPage,
        isLoading: false
      };

    case EXPENSE_ACTIONS.ADD_EXPENSE:
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        total: state.total + 1
      };

    case EXPENSE_ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(e =>
          e._id === action.payload._id ? action.payload : e
        )
      };

    case EXPENSE_ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(e => e._id !== action.payload),
        total: state.total - 1
      };

    case EXPENSE_ACTIONS.SET_SUMMARY:
      return { ...state, summary: action.payload };

    case EXPENSE_ACTIONS.SET_BUDGET:
      return { ...state, budget: action.payload };

    case EXPENSE_ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    default:
      return state;
  }
};

export const ExpenseProvider = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  const fetchExpenses = useCallback(async (params = {}) => {
    dispatch({ type: EXPENSE_ACTIONS.SET_LOADING, payload: true });
    try {
      const data = await expenseService.getAll({
        ...state.filters,
        ...params,
        limit: 20
      });
      dispatch({
        type: EXPENSE_ACTIONS.SET_EXPENSES,
        payload: {
          expenses: data.expenses,
          total: data.total,
          totalPages: data.totalPages,
          currentPage: data.currentPage
        }
      });
    } catch (error) {
      dispatch({ type: EXPENSE_ACTIONS.SET_LOADING, payload: false });
    }
  }, [state.filters]);

  const addExpense = useCallback(async (data) => {
    try {
      const response = await expenseService.create(data);
      dispatch({ type: EXPENSE_ACTIONS.ADD_EXPENSE, payload: response.expense });
      toast.success('Expense added! 💸');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to add expense');
      return { success: false };
    }
  }, []);

  const updateExpense = useCallback(async (id, data) => {
    try {
      const response = await expenseService.update(id, data);
      dispatch({ type: EXPENSE_ACTIONS.UPDATE_EXPENSE, payload: response.expense });
      toast.success('Expense updated!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to update expense');
      return { success: false };
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    try {
      await expenseService.delete(id);
      dispatch({ type: EXPENSE_ACTIONS.DELETE_EXPENSE, payload: id });
      toast.success('Expense deleted');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to delete expense');
      return { success: false };
    }
  }, []);

  const fetchSummary = useCallback(async (month, year) => {
    try {
      const data = await expenseService.getMonthlySummary({ month, year });
      dispatch({ type: EXPENSE_ACTIONS.SET_SUMMARY, payload: data.data });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, []);

  const fetchBudget = useCallback(async (month, year) => {
    try {
      const data = await expenseService.getBudget({ month, year });
      dispatch({ type: EXPENSE_ACTIONS.SET_BUDGET, payload: data.data });
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: EXPENSE_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const value = {
    ...state,
    fetchExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    fetchSummary,
    fetchBudget,
    setFilters
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) throw new Error('useExpenses must be used within ExpenseProvider');
  return context;
};