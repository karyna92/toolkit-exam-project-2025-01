import React, { useState, useEffect } from 'react';
import CONSTANTS from '../../constants';
import styles from './events.module.sass';
import EventTimer from './EventTimer';

const EventItem = ({
  event,
  handleNotify,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const remindBeforeMs = (event.remindBefore || 0) * 60 * 1000;
  const eventDate = new Date(event.dateTime);
  const notifyTime = new Date(eventDate.getTime() - remindBeforeMs);

  const totalTime = Math.max(
    1,
    notifyTime - new Date(event.createdAt || Date.now())
  );
  const [timeLeft, setTimeLeft] = useState(
    Math.max(0, notifyTime - new Date())
  );
  const [progress, setProgress] = useState(0);

useEffect(() => {
  const now = Date.now();
  const eventTime = new Date(event.dateTime).getTime();

  if (now - eventTime > 24 * 60 * 60 * 1000) {
    onDelete(event.id);
  }
}, [event.dateTime, event.id, onDelete]);

useEffect(() => {
  const interval = setInterval(() => {
    const now = new Date();
    const left = Math.max(0, notifyTime - now);
    setTimeLeft(left);

    const progressPercent = Math.min(
      100,
      ((totalTime - left) / totalTime) * 100
    );
    setProgress(progressPercent);

    if (left === 0 && progressPercent >= 100) {
      handleNotify({ ...event, notify: true });
    }
  }, 1000);

  return () => clearInterval(interval);
}, [notifyTime, totalTime, handleNotify, event]);


  const handleDeleteClick = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(event.id), 400);
  };

  return (
    <li className={`${styles.listItem} ${isDeleting ? styles.fadeOut : ''}`}>
      <div className={styles.eventItem}>
        <div className={styles.eventContent}>
          <div
            className={styles.progressBar}
            style={{ width: timeLeft > 0 ? `${progress}%` : '100%' }}
          />
          <div className={styles.eventElement}>
            <h3 className={styles.eventName}>{event.name}</h3>
            <p
              className={timeLeft > 0 ? styles.eventDate : styles.pastEventDate}
            >
              {eventDate.toLocaleString()}
            </p>
          </div>
          <button className={styles.deleteButton} onClick={handleDeleteClick}>
            <img
              src={`${CONSTANTS.STATIC_IMAGES_PATH}rubbish-bin.svg`}
              alt="delete"
            />
          </button>
        </div>

        {timeLeft <= 0 && (
          <>
            <div className={styles.eventStatusWrapper}></div>
            <span className={styles.eventStatus}>ongoing event</span>
          </>
        )}

        <div className={styles.timerWrapper}>
          {timeLeft > 0 && <EventTimer notifyTime={notifyTime} />}
        </div>
      </div>
    </li>
  );
};

export default EventItem;
