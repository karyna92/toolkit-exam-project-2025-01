import React from 'react';
import styles from './Step.module.sass';

const Step = ({ stepNumber, children }) => (
  <div className={styles.step}>
    <span className={styles.stepTitle}>{`Step ${stepNumber}`}</span>
    <p>{children}</p>
    <span className={styles.stepsArrow}>→</span>
  </div>
);

export default Step;
