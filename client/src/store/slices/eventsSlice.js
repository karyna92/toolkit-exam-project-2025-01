import { createSlice } from '@reduxjs/toolkit';

const LOCAL_STORAGE_KEY = 'eventsState';

const loadState = () => {
  try {
    const serialized = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!serialized) return null;
    const parsed = JSON.parse(serialized);

    const now = Date.now();
    parsed.ongoingEvents = parsed.ongoingEvents.filter(
      (e) => now - new Date(e.dateTime).getTime() < 24 * 60 * 60 * 1000
    );
    parsed.events = parsed.events.filter(
      (e) => now - new Date(e.dateTime).getTime() < 24 * 60 * 60 * 1000
    );
    return parsed;
  } catch (e) {
    console.error('Failed to load events from localStorage', e);
    return null;
  }
};

const saveState = (state) => {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(LOCAL_STORAGE_KEY, serialized);
  } catch (e) {
    console.error('Failed to save events to localStorage', e);
  }
};

const initialState = loadState() || {
  events: [],
  ongoingEvents: [],
  hasSeenOngoingEvents: false,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEvents(state, action) {
      state.events = action.payload;
      saveState(state);
    },
    addEvent(state, action) {
      const event = {
        ...action.payload,
        dateTime: new Date(action.payload.dateTime).toISOString(),
      };
      state.events.push(event);
      state.events.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
      saveState(state);
    },
    deleteEvent(state, action) {
      const id = action.payload;
      state.events = state.events.filter((e) => e.id !== id);
      state.ongoingEvents = state.ongoingEvents.filter((e) => e.id !== id);
      saveState(state);
    },
    addOngoingEvent(state, action) {
      if (!state.ongoingEvents.find((e) => e.id === action.payload.id)) {
        state.ongoingEvents.push({
          ...action.payload,
          dateTime: new Date(action.payload.dateTime).toISOString(),
        });
        state.hasSeenOngoingEvents = false;
        saveState(state);
      }
    },
    markOngoingEventsAsSeen(state) {
      state.hasSeenOngoingEvents = true;
      saveState(state);
    },
  },
});

export const {
  setEvents,
  addEvent,
  deleteEvent,
  addOngoingEvent,
  markOngoingEventsAsSeen,
} = eventsSlice.actions;

export default eventsSlice.reducer;
