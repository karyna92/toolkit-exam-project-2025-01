import React from 'react';
import SelectInput from '../SelectInput/SelectInput';
import FormInput from '../FormInput/FormInput';
import Spinner from '../Spinner/Spinner';
import CONSTANTS from '../../constants';
import styles from '../ContestForm/ContestForm.module.sass';

const OptionalSelects = ({ isFetching, contestType, dataForContest }) => {
  if (isFetching) {
    return <Spinner />;
  }

  const { data } = dataForContest;

  switch (contestType) {
    case CONSTANTS.NAME_CONTEST:
      return (
        <>
          <SelectInput
            name="typeOfName"
            header="type of company"
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            optionsArray={data.typeOfName}
          />
          <SelectInput
            name="styleName"
            header="Style name"
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            optionsArray={data.nameStyle}
          />
        </>
      );

    case CONSTANTS.LOGO_CONTEST:
      return (
        <>
          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>
              What name of your venture?
            </span>
            <FormInput
              name="nameVenture"
              type="text"
              label="name of venture"
              classes={{
                container: styles.componentInputContainer,
                input: styles.input,
                warning: styles.warning,
              }}
            />
          </div>
          <SelectInput
            name="brandStyle"
            header="Brand Style"
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            optionsArray={data.brandStyle}
          />
        </>
      );

    case CONSTANTS.TAGLINE_CONTEST:
      return (
        <>
          <div className={styles.inputContainer}>
            <span className={styles.inputHeader}>
              What name of your venture?
            </span>
            <FormInput
              name="nameVenture"
              type="text"
              label="name of venture"
              classes={{
                container: styles.componentInputContainer,
                input: styles.input,
                warning: styles.warning,
              }}
            />
          </div>
          <SelectInput
            name="typeOfTagline"
            header="Type tagline"
            classes={{
              inputContainer: styles.selectInputContainer,
              inputHeader: styles.selectHeader,
              selectInput: styles.select,
              warning: styles.warning,
            }}
            optionsArray={data.typeOfTagline}
          />
        </>
      );

    default:
      return null;
  }
};

export default OptionalSelects;
