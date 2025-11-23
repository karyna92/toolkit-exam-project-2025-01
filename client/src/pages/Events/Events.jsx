import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EventForm from '../../components/Events/EventForm';
import EventList from '../../components/Events/EventList';
import styles from './eventsPage.module.sass';
import {
  addEvent as addEventAction,
  deleteEvent as deleteEventAction,
  addOngoingEvent as addOngoingEventAction,
  markEventAsSeen as markOngoingEventsAsSeenAction,
} from '../../store/slices/eventsSlice';

const Events = () => {
  const dispatch = useDispatch();
  const events = useSelector((state) => state.events.events);
  const ongoingEvents = useSelector((state) => state.events.ongoingEvents);

  useEffect(() => {
    if (ongoingEvents.length > 0) {
      dispatch(markOngoingEventsAsSeenAction());
    }
  }, [ongoingEvents, dispatch]);

  const handleAdd = useCallback(
    (event) => {
      dispatch(addEventAction(event));
    },
    [dispatch]
  );

  const handleNotify = useCallback(
    (event) => {
      dispatch(addOngoingEventAction(event));
    },
    [dispatch]
  );

  const handleDelete = useCallback(
    (eventId) => {
      dispatch(deleteEventAction(eventId));
    },
    [dispatch]
  );

  return (
    <div className={styles.eventsContainer}>
      <EventForm onAdd={handleAdd} />
      <EventList
        events={events}
        handleNotify={handleNotify}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Events;
