import React, { useEffect } from 'react';
import { Formik, Form } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { getDataForContest } from '../../store/slices/dataForContestSlice';
import Spinner from '../Spinner/Spinner';
import ButtonGroup from '../ButtonGroup/ButtonGroup';
import FormInput from '../FormInput/FormInput';
import SelectInput from '../SelectInput/SelectInput';
import FieldFileInput from '../InputComponents/FieldFileInput/FieldFileInput';
import FormTextArea from '../InputComponents/FormTextArea/FormTextArea';
import TryAgain from '../TryAgain/TryAgain';
import Schems from '../../utils/validators/validationSchems';
import OptionalSelects from '../OptionalSelects/OptionalSelects';
import CONSTANTS from '../../constants';
import styles from './ContestForm.module.sass';

const variableOptions = {
  [CONSTANTS.NAME_CONTEST]: {
    styleName: '',
    typeOfName: '',
  },
  [CONSTANTS.LOGO_CONTEST]: {
    nameVenture: '',
    brandStyle: '',
  },
  [CONSTANTS.TAGLINE_CONTEST]: {
    nameVenture: '',
    typeOfTagline: '',
  },
};

const ContestForm = ({ contestType, handleSubmit, formRef, defaultData }) => {
  const dispatch = useDispatch();
  const dataForContest = useSelector((state) => state.dataForContest);
  const isEditContest = useSelector(
    (state) => state.contestByIdStore.isEditContest
  );

  const getPreference = () => {
    switch (contestType) {
      case CONSTANTS.NAME_CONTEST:
        dispatch(
          getDataForContest({
            characteristic1: 'nameStyle',
            characteristic2: 'typeOfName',
          })
        );
        break;
      case CONSTANTS.TAGLINE_CONTEST:
        dispatch(getDataForContest({ characteristic1: 'typeOfTagline' }));
        break;
      case CONSTANTS.LOGO_CONTEST:
        dispatch(getDataForContest({ characteristic1: 'brandStyle' }));
        break;
      default:
        dispatch(
          getDataForContest({
            characteristic1: 'nameStyle',
            characteristic2: 'typeOfName',
          })
        );
    }
  };

  useEffect(() => {
    getPreference();
  }, [contestType]);

  if (dataForContest.error) {
    return <TryAgain getData={getPreference} />;
  }

  if (dataForContest.isFetching) {
    return <Spinner />;
  }

  return (
    <div className={styles.formContainer}>
      <Formik
        initialValues={{
          title: '',
          industry: '',
          focusOfWork: '',
          targetCustomer: '',
          file: '',
          domainOption: 0,
          ...variableOptions[contestType],
          ...defaultData,
        }}
        onSubmit={handleSubmit}
        validationSchema={Schems.ContestSchem}
        innerRef={formRef}
        enableReinitialize
      >
        {({ values, setFieldValue }) => (
          <Form>
            <div className={styles.inputContainer}>
              <span className={styles.inputHeader}>Title of contest</span>
              <FormInput
                name="title"
                type="text"
                label="Title"
                classes={{
                  container: styles.componentInputContainer,
                  input: styles.input,
                  warning: styles.warning,
                }}
              />
            </div>

            <div className={styles.inputContainer}>
              <SelectInput
                name="industry"
                classes={{
                  inputContainer: styles.selectInputContainer,
                  inputHeader: styles.selectHeader,
                  selectInput: styles.select,
                  warning: styles.warning,
                }}
                header="Describe industry associated with your venture"
                optionsArray={dataForContest.data.industry}
              />
            </div>

            <div className={styles.inputContainer}>
              <span className={styles.inputHeader}>
                What does your company / business do?
              </span>
              <FormTextArea
                name="focusOfWork"
                type="text"
                label="e.g. We’re an online lifestyle brand that provides stylish and high quality apparel to the expert eco-conscious shopper"
                classes={{
                  container: styles.componentInputContainer,
                  inputStyle: styles.textArea,
                  warning: styles.warning,
                }}
              />
            </div>

            <div className={styles.inputContainer}>
              <span className={styles.inputHeader}>
                Tell us about your customers
              </span>
              <FormTextArea
                name="targetCustomer"
                type="text"
                label="customers"
                classes={{
                  container: styles.componentInputContainer,
                  inputStyle: styles.textArea,
                  warning: styles.warning,
                }}
              />
            </div>

            <OptionalSelects
              contestType={contestType}
              dataForContest={dataForContest}
              isEditContest={isEditContest}
            />

            {contestType?.trim() === CONSTANTS.NAME_CONTEST && (
              <ButtonGroup
                selected={values.domainOption}
                onChange={(val) => setFieldValue('domainOption', val)}
              />
            )}

            <FieldFileInput
              name="file"
              classes={{
                fileUploadContainer: styles.fileUploadContainer,
                labelClass: styles.label,
                fileNameClass: styles.fileName,
                fileInput: styles.fileInput,
                warning: styles.warning,
              }}
              type="file"
            />

            {isEditContest && (
              <button type="submit" className={styles.changeData}>
                Set Data
              </button>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ContestForm;
