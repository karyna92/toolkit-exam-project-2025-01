import React from 'react';
import CONSTANTS from '../../constants';
import styles from './Card.module.sass';

const { STATIC_IMAGES_PATH } = CONSTANTS;

const Card = ({ image, title, description, buttonText, onClick }) => (
  <div className={styles.card}>
    <div>
      <span>
        <img src={`${STATIC_IMAGES_PATH}${image}`} alt={title} />
      </span>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
    <div>
      <button onClick={onClick}>
        <span>{buttonText}</span>
        <span className={styles.cardButtonArrow}>→</span>
      </button>
    </div>
  </div>
);

export default Card;
