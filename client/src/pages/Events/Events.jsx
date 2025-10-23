import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import EventForm from '../../components/Events/EventForm';
import EventList from '../../components/Events/EventList';
import styles from './eventsPage.module.sass';
import {
  addEvent as addEventAction,
  deleteEvent as deleteEventAction,
  addOngoingEvent as addOngoingEventAction,
  markOngoingEventsAsSeen as markOngoingEventsAsSeenAction,
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

  return (
    <div className={styles.eventsContainer}>
      <EventForm onAdd={(event) => dispatch(addEventAction(event))} />
      <EventList
        events={events}
        handleNotify={(event) => dispatch(addOngoingEventAction(event))}
        onDelete={(eventId) => dispatch(deleteEventAction(eventId))}
      />
    </div>
  );
};

export default Events;
