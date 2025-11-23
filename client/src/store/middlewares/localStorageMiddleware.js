const LOCAL_STORAGE_KEY = 'eventsState';

export const localStorageMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  const actionsToSave = [
    'events/setEventsState',
    'events/addEvent',
    'events/deleteEvent',
    'events/addOngoingEvent',
    'events/markEventAsSeen',
    'events/markAllOngoingEventsAsSeen',
    'events/cleanupSeenEvents',
  ];

  if (actionsToSave.includes(action.type)) {
    try {
      const state = store.getState();
      const userId = state.userStore?.data?.id;

      if (!userId) {
        return result;
      }

      const dataToSave = {
        events: state.events.events || [],
        ongoingEvents: state.events.ongoingEvents || [],
        seenEventIds: state.events.seenEventIds || [], 
      };

      localStorage.setItem(
        `${LOCAL_STORAGE_KEY}_${userId}`,
        JSON.stringify(dataToSave)
      );
    } catch (e) {
      console.error('Failed to save events to localStorage', e);
    }
  }

  return result;
};
