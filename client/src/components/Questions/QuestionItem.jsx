import React from 'react';
import styles from './Questions.module.sass'; 

const QuestionItem = ({ question, answer, isOpen, onToggle }) => (
  <div
    className={`${styles.questionItem} ${isOpen ? styles.open : ''}`}
    onClick={onToggle}
  >
    <div className={`${styles.question} ${isOpen ? styles.open : ''}`}>
      <p>{question}</p>
      <span>{isOpen ? '×' : '+'}</span>
    </div>
    <div className={`${styles.answerWrapper} ${isOpen ? styles.open : ''}`}>
      <article className={`${styles.answer} ${isOpen ? styles.open : ''}`}>
        {answer}
      </article>
    </div>
  </div>
);

export default QuestionItem;
