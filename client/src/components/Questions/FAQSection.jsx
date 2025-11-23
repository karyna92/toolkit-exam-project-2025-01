import React from 'react';
import QuestionItem from './QuestionItem' 
import styles from './Questions.module.sass';

const FAQSection = ({ tab, items, openIndexes, toggleQuestion }) => (
  <div className={styles.faqSection} ref={tab?.ref} key={tab?.name}>
    <h2>{tab?.name}</h2>
    {items.map((item, index) => {
      const globalIndex = `${tab.name}-${index}`;
      return (
        <QuestionItem
          key={globalIndex}
          question={item.question}
          answer={item.answer}
          isOpen={openIndexes.includes(globalIndex)}
          onToggle={() => toggleQuestion(globalIndex)}
        />
      );
    })}
  </div>
);

export default FAQSection;
