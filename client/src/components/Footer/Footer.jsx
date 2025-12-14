import React from 'react';
import { useSelector } from 'react-redux';
import styles from './Footer.module.sass';
import CONSTANTS from '../../constants';

const Footer = ({ navigate }) => {
  const data = useSelector((state) => state.userStore.data);
  const isModerator = data?.role === 'moderator';

  // If user is a moderator, don't render the footer
  if (isModerator) {
    return null;
  }

  const topFooterItemsRender = (item) => {
    return (
      <div key={item.title}>
        <h4>{item.title}</h4>
        {item.items.map((i) => (
          <a
            key={i}
            href="https://google.com"
            onClick={(e) => {
              e.preventDefault();
              if (i === 'How It Works') {
                navigate('/information');
              } else {
                window.location.href = 'https://google.com';
              }
            }}
          >
            {i}
          </a>
        ))}
      </div>
    );
  };

  const topFooterRender = () => {
    return CONSTANTS.FooterItems.map((item) => topFooterItemsRender(item));
  };

  return (
    <div className={styles.footerContainer}>
      <div className={styles.footerTop}>
        <div>{topFooterRender()}</div>
      </div>
    </div>
  );
};

export default Footer;
