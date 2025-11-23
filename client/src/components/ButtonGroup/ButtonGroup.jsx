import React, { useCallback } from 'react';
import OptionButton from './OptionButton'
import styles from './ButtonGroup.module.sass';

const BUTTONS = [
  {
    id: 0,
    title: 'Yes',
    subtitle: 'Recommended',
    description: 'But minor variations are allowed',
  },
  {
    id: 1,
    title: 'Yes',
    subtitle: null,
    description: 'The Domain should exactly match the name',
  },
  {
    id: 2,
    title: 'No',
    subtitle: null,
    description: 'I am only looking for a name, not a Domain',
  },
];

const ButtonGroup = ({ selected, onChange }) => {
  const handleClick = useCallback(
    (id) => {
      onChange(id);
    },
    [onChange]
  );

  return (
    <section className={styles.buttonGroup}>
      <h2>Do you want a matching domain (.com URL) with your name?</h2>
      <div className={styles.options}>
        {BUTTONS.map((option) => (
          <OptionButton
            key={option.id}
            option={option}
            isSelected={selected === option.id}
            onClick={() => handleClick(option.id)}
          />
        ))}
      </div>
    </section>
  );
};

export default ButtonGroup;
