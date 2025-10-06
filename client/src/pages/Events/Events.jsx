import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import EventForm from '../../components/Events/EventForm';
import EventList from '../../components/Events/EventList';
import styles from './eventsPage.module.sass';
import {
  addEvent,
  deleteEvent,
  addOngoingEvent,
  markOngoingEventsAsSeen,
} from '../../store/slices/eventsSlice';

const Events = ({
  events,
  ongoingEvents,
  addEvent,
  deleteEvent,
  addOngoingEvent,
  markOngoingEventsAsSeen,
}) => {
  useEffect(() => {
    if (ongoingEvents.length > 0) {
      markOngoingEventsAsSeen();
    }
  }, []);

  return (
    <div className={styles.eventsContainer}>
      <EventForm onAdd={addEvent} />
      <EventList
        events={events}
        handleNotify={addOngoingEvent}
        onDelete={deleteEvent}
      />
    </div>
  );
};

const mapStateToProps = (state) => ({
  events: state.events.events,
  ongoingEvents: state.events.ongoingEvents,
});

const mapDispatchToProps = {
  addEvent,
  deleteEvent,
  addOngoingEvent,
  markOngoingEventsAsSeen,
};

export default connect(mapStateToProps, mapDispatchToProps)(Events);
