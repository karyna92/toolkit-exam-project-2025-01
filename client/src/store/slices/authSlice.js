import { createSlice } from '@reduxjs/toolkit';
import CONSTANTS from '../../constants';
import * as restController from '../../api/rest/restController';
import {
  decorateAsyncThunk,
  pendingReducer,
  fulfilledReducer,
  rejectedReducer,
} from '../../utils/store';
import { setUserData } from './userSlice';

const AUTH_SLICE_NAME = 'auth';

const initialState = {
  isFetching: false,
  error: null,
};

export const checkAuth = decorateAsyncThunk({
  key: `${AUTH_SLICE_NAME}/checkAuth`,
  thunk: async (
    { data: authInfo, authMode },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const authResponse =
        authMode === CONSTANTS.AUTH_MODE.LOGIN
          ? await restController.loginRequest(authInfo)
          : await restController.registerRequest(authInfo);

      if (authResponse?.data?.token) {
        localStorage.setItem(CONSTANTS.ACCESS_TOKEN, authResponse.data.token);
      }

      const userResponse = await restController.getUser();
      const user = userResponse.data;

      dispatch(setUserData(user));

      return user;
    } catch (err) {
      return rejectWithValue({
        data: err?.response?.data ?? 'Gateway Timeout',
        status: err?.response?.status ?? 504,
      });
    }
  },
});

const reducers = {
  clearAuthError: (state) => {
    state.error = null;
  },
  clearAuth: () => initialState,
};

const extraReducers = (builder) => {
  builder.addCase(checkAuth.pending, pendingReducer);
  builder.addCase(checkAuth.fulfilled, (state, action) => {
    state.isFetching = false;
    state.data = action.payload;
    state.error = null;
  });
  builder.addCase(checkAuth.rejected, rejectedReducer);
};

const authSlice = createSlice({
  name: `${AUTH_SLICE_NAME}`,
  initialState,
  reducers,
  extraReducers,
});

const { actions, reducer } = authSlice;

export const { clearAuthError, clearAuth } = actions;

export default reducer;
