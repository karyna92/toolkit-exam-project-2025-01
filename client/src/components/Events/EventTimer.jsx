import { useState, useEffect } from 'react';

const EventTimer = ({ notifyTime }) => {
  const [timeLeft, setTimeLeft] = useState(notifyTime - new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, notifyTime - new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, [notifyTime]);

  const days = Math.floor(timeLeft / 1000 / 60 / 60 / 24);
  const hours = Math.floor((timeLeft / 1000 / 60 / 60) % 24);
  const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return <p>{parts.join(' ')}</p>;
};

export default EventTimer;
