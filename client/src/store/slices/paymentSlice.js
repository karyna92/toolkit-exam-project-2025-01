import { createSlice } from '@reduxjs/toolkit';
import * as restController from '../../api/rest/restController';
import { clearContestStore } from './contestCreationSlice';
import { changeProfileViewMode } from './userProfileSlice';
import { updateUser } from './userSlice';
import CONSTANTS from '../../constants';
import { decorateAsyncThunk, pendingReducer } from '../../utils/store';

const PAYMENT_SLICE_NAME = 'payment';

const initialState = {
  isFetching: false,
  error: null,
  focusOnElement: 'number',
};

export const pay = decorateAsyncThunk({
  key: `${PAYMENT_SLICE_NAME}/pay`,
  thunk: async ({ data, navigate }, { dispatch, rejectWithValue }) => {
    try {
      const response = await restController.payment(data);

      navigate('/dashboard', { replace: true });
      dispatch(clearContestStore());

      return response.data;
    } catch (err) {
      const errorData = err.response?.data?.error;

      return rejectWithValue({
        status: err.response?.status || 500,
        data: {
          code: errorData?.code || 'internal_error',
          message: errorData?.message || 'An error occurred',
          userMessage:
            errorData?.userMessage ||
            'Payment failed. Please check your details or try again later.',
          ...errorData,
        },
      });
    }
  },
});

export const cashOut = decorateAsyncThunk({
  key: `${PAYMENT_SLICE_NAME}/cashOut`,
  thunk: async (payload, { dispatch, rejectWithValue }) => {
    try {
      const { data } = await restController.cashOut(payload);
      dispatch(updateUser.fulfilled(data));
      dispatch(changeProfileViewMode(CONSTANTS.USER_INFO_MODE));
      return data;
    } catch (err) {
      const errorData = err.response?.data?.error;

      return rejectWithValue({
        status: err.response?.status || 500,
        data: {
          code: errorData?.code || 'internal_error',
          message: errorData?.message || 'Cash out failed',
          userMessage:
            errorData?.userMessage ||
            'Unable to process cash out. Please check your details.',
        },
      });
    }
  },
});

const reducers = {
  changeFocusOnCard: (state, { payload }) => {
    state.focusOnElement = payload;
  },
  clearPaymentStore: () => initialState,
  clearPaymentError: (state) => {
    state.error = null;
  },
};

const extraReducers = (builder) => {
  builder
    .addCase(pay.pending, pendingReducer)
    .addCase(pay.fulfilled, (state) => {
      state.isFetching = false;
      state.error = null;
    })
    .addCase(pay.rejected, (state, action) => {
      state.isFetching = false;
      state.error = action.payload || {
        status: 500,
        data: {
          code: 'internal_error',
          message: 'Unknown error occurred',
          userMessage: 'Payment failed. Please try again.',
        },
      };
    })
    .addCase(cashOut.pending, pendingReducer)
    .addCase(cashOut.fulfilled, (state) => {
      state.isFetching = false;
      state.error = null;
    })
    .addCase(cashOut.rejected, (state, action) => {
      state.isFetching = false;
      state.error = action.payload;
    });
};

const paymentSlice = createSlice({
  name: PAYMENT_SLICE_NAME,
  initialState,
  reducers,
  extraReducers,
});

export const { changeFocusOnCard, clearPaymentStore, clearPaymentError } =
  paymentSlice.actions;

export default paymentSlice.reducer;
