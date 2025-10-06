import EventItem from './EventItem';
import styles from './events.module.sass';
import CONSTANTS from '../../constants'

const EventList = ({ events, onDelete, handleNotify }) => {
  if (!events.length) return <p className={styles.empty}>No upcoming events</p>;

  return (
    <section className={styles.listSection}>
      <header>
        <h1 className={styles.heading}>Live upcoming checks</h1>
        <div>
          <span>remaining time</span>
          <img
            className={styles.remainingTime}
            src={`${CONSTANTS.STATIC_IMAGES_PATH}remaining-time.svg`}
            alt="check"
          />
        </div>
      </header>
      <ul className={styles.list}>
        {events
          .slice()
          .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
          .map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onDelete={onDelete}
              handleNotify={handleNotify}
            />
          ))}
      </ul>
    </section>
  );
};

export default EventList;
