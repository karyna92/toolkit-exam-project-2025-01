import { createSlice } from '@reduxjs/toolkit';
import * as restController from '../../api/rest/restController';
import {
  decorateAsyncThunk,
  createExtraReducers,
  rejectedReducer,
} from '../../utils/store';

const OFFERS_SLICE_NAME = 'contestsWithOffers';

const initialState = {
  contestsWithOffers: [],
  isFetching: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  },
};

//---------- getAllOffers
export const getContestsWithOffers = decorateAsyncThunk({
  key: `${OFFERS_SLICE_NAME}/getContestsWithOffers`,
  thunk: async (params) => {
    const { data } = await restController.getContestsWithOffers(params);
    return data;
  },
});

const getContestsWithOffersExtraReducers = createExtraReducers({
  thunk: getContestsWithOffers,
  pendingReducer: (state) => {
    state.isFetching = true;
    state.error = null;
  },
  fulfilledReducer: (state, { payload }) => {
    state.isFetching = false;
    state.contestsWithOffers = payload.contests;
    state.pagination = {
      currentPage: payload.currentPage,
      totalPages: payload.totalPages,
      totalCount: payload.totalCount,
    };
  },
  rejectedReducer,
});

const extraReducers = (builder) => {
  getContestsWithOffersExtraReducers(builder);
};

const contestsWithOffersSlice = createSlice({
  name: OFFERS_SLICE_NAME,
  initialState,
  reducers: {
    updateOfferStatus: (state, action) => {
      const { offerId, status } = action.payload;
      state.contestsWithOffers.forEach((contest) => {
        if (contest.Offers && contest.Offers.length > 0) {
          const offerIndex = contest.Offers.findIndex(
            (offer) => offer.id === offerId
          );
          if (offerIndex !== -1) {
            contest.Offers[offerIndex].status = status;
          }
        }
      });
    },
  },
  extraReducers,
});

export const { updateOfferStatus } = contestsWithOffersSlice.actions;
export default contestsWithOffersSlice.reducer;
