import classNames from 'classnames';
import CONSTANTS from '../../constants';
import styles from './ButtonGroup.module.sass';

const OptionButton = ({ option, isSelected, onClick }) => {
  return (
    <button
      type="button"
      className={classNames(styles.btn, { [styles.activeTab]: isSelected })}
      onClick={onClick}
    >
      {option.subtitle && (
        <span className={styles.subtitle}>{option.subtitle}</span>
      )}

      {isSelected && (
        <img
          className={styles.check}
          src={`${CONSTANTS.STATIC_IMAGES_PATH}green_check.svg`}
          alt="check"
        />
      )}

      <h3>{option.title}</h3>
      <p>{option.description}</p>
    </button>
  );
};

export default OptionButton