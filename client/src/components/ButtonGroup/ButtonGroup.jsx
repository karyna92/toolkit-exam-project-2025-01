import CONSTANTS from '../../constants';
import styles from './ButtonGroup.module.sass';

const ButtonGroup = ({ selected, onChange }) => {
  const handleClick = (index) => {
    onChange(index); 
  };

  return (
    <section className={styles.matchingDomain}>
      <h2>Do you want a matching domain (.com URL) with your name?</h2>
      <div className={styles.options}>
        {[0, 1, 2].map((index) => (
          <button
            type="button"
            key={index}
            className={`${styles.btn} ${
              selected === index ? styles.activeTab : ''
            }`}
            onClick={() => handleClick(index)}
          >
            {index === 0 && (
              <span className={styles.subtitle}>Recommended</span>
            )}
            {selected === index && (
              <img
                className={styles.check}
                src={`${CONSTANTS.STATIC_IMAGES_PATH}green_check.svg`}
                alt="check"
              />
            )}
            <h3>{index === 0 ? 'Yes' : index === 1 ? 'Yes' : 'No'}</h3>
            <p>
              {index === 0
                ? 'But minor variations are allowed'
                : index === 1
                ? 'The Domain should exactly match the name'
                : 'I am only looking for a name, not a Domain'}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
};
export default ButtonGroup;

