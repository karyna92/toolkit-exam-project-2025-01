import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  events: [],
  ongoingEvents: [],
  seenEventIds: [], 
};

const cleanOldEvents = (events) => {
  const now = Date.now();
  return events.filter(
    (e) => now - new Date(e.dateTime).getTime() < 24 * 60 * 60 * 1000
  );
};

export const checkForOngoingEvents = () => (dispatch, getState) => {
  const state = getState().events;
  const now = new Date();

  state.events.forEach((event) => {
    const eventTime = new Date(event.dateTime);
    const remindBeforeMs = (event.remindBefore || 0) * 60 * 1000;
    const notifyTime = new Date(eventTime.getTime() - remindBeforeMs);

    if (
      now >= notifyTime &&
      !state.ongoingEvents.find((e) => e.id === event.id)
    ) {
      dispatch(addOngoingEvent({ ...event, notify: true }));
    }
  });
};

export const loadEventsForUser = (userId) => (dispatch) => {
  if (!userId) return;

  try {
    const serialized = localStorage.getItem(`eventsState_${userId}`);
    if (!serialized) return;

    const parsed = JSON.parse(serialized);

    const cleanedEvents = cleanOldEvents(parsed.events || []);
    const cleanedOngoingEvents = cleanOldEvents(parsed.ongoingEvents || []);

    dispatch(
      setEventsState({
        events: cleanedEvents,
        ongoingEvents: cleanedOngoingEvents,
        seenEventIds: parsed.seenEventIds || [], 
      })
    );

    dispatch(checkForOngoingEvents());
  } catch (e) {
    console.error('Failed to load events from localStorage', e);
  }
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventsState(state, action) {
      state.events = action.payload.events || [];
      state.ongoingEvents = action.payload.ongoingEvents || [];
      state.seenEventIds = action.payload.seenEventIds || [];
    },
    addEvent(state, action) {
      const event = {
        ...action.payload,
        dateTime: new Date(action.payload.dateTime).toISOString(),
      };
      state.events.push(event);
      state.events.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    },
    deleteEvent(state, action) {
      const id = action.payload;
      state.events = state.events.filter((e) => e.id !== id);
      state.ongoingEvents = state.ongoingEvents.filter((e) => e.id !== id);
      state.seenEventIds = state.seenEventIds.filter((seenId) => seenId !== id);
    },
    addOngoingEvent(state, action) {
      if (!state.ongoingEvents.find((e) => e.id === action.payload.id)) {
        state.ongoingEvents.push({
          ...action.payload,
          dateTime: new Date(action.payload.dateTime).toISOString(),
        });
      }
    },
    markEventAsSeen(state, action) {
      const eventId = action.payload;
      if (!state.seenEventIds.includes(eventId)) {
        state.seenEventIds.push(eventId);
      }
    },
    markAllOngoingEventsAsSeen(state) {
      state.ongoingEvents.forEach((event) => {
        if (!state.seenEventIds.includes(event.id)) {
          state.seenEventIds.push(event.id);
        }
      });
    },
    cleanupSeenEvents(state) {
      state.seenEventIds = state.seenEventIds.filter(
        (seenId) =>
          state.events.some((event) => event.id === seenId) ||
          state.ongoingEvents.some((event) => event.id === seenId)
      );
    },
  },
});

export const {
  setEventsState,
  addEvent,
  deleteEvent,
  addOngoingEvent,
  markEventAsSeen,
  markAllOngoingEventsAsSeen,
  cleanupSeenEvents,
} = eventsSlice.actions;

export default eventsSlice.reducer;
