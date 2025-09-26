import React, { Component } from 'react';
import styles from './Footer.module.sass';
import CONSTANTS from '../../constants';

class Footer extends Component {
  topFooterItemsRender = (item) => {
    const { navigate } = this.props;

    return (
      <div key={item.title}>
        <h4>{item.title}</h4>
        {item.items.map((i) => (
          <a
            key={i}
            href="https://google.com"
            onClick={(e) => {
              e.preventDefault();
              if (i === 'How It Works?') {
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

  topFooterRender() {
    return CONSTANTS.FooterItems.map((item) => this.topFooterItemsRender(item));
  }

  render() {
    return (
      <div className={styles.footerContainer}>
        <div className={styles.footerTop}>
          <div>{this.topFooterRender()}</div>
        </div>
      </div>
    );
  }
}

export default Footer;
