import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import {
  addOffer,
  clearAddOfferError,
} from '../../store/slices/contestByIdSlice';
import ImageUpload from '../InputComponents/ImageUpload/ImageUpload';
import FormInput from '../FormInput/FormInput';
import Schems from '../../utils/validators/validationSchems';
import Error from '../Error/Error';
import CONSTANTS from '../../constants';
import styles from './OfferForm.module.sass';

const OfferForm = ({ contestType, contestId, customerId }) => {
  const dispatch = useDispatch();
  const addOfferError = useSelector(
    (state) => state.contestByIdStore.addOfferError
  );

  const renderOfferInput = () => {
    if (contestType === CONSTANTS.LOGO_CONTEST) {
      return (
        <ImageUpload
          name="offerData"
          classes={{
            uploadContainer: styles.imageUploadContainer,
            inputContainer: styles.uploadInputContainer,
            imgStyle: styles.imgStyle,
          }}
        />
      );
    }

    return (
      <FormInput
        name="offerData"
        classes={{
          container: styles.inputContainer,
          input: styles.input,
          warning: styles.fieldWarning,
          notValid: styles.notValid,
        }}
        type="text"
        label="Your suggestion"
      />
    );
  };

  const setOffer = (values, { resetForm }) => {
    dispatch(clearAddOfferError());
    const data = new FormData();

    data.append('contestId', contestId);
    data.append('contestType', contestType);
    data.append('customerId', customerId);

    if (values.offerData instanceof File) {
      data.append('file', values.offerData);
    } else {
      data.append('offerData', values.offerData);
    }

    dispatch(addOffer(data));
    resetForm();
  };

  const validationSchema =
    contestType === CONSTANTS.LOGO_CONTEST
      ? Schems.LogoOfferSchema
      : Schems.TextOfferSchema;

  return (
    <div className={styles.offerContainer}>
      {addOfferError && (
        <Error
          data={addOfferError.data}
          status={addOfferError.status}
          clearError={() => dispatch(clearAddOfferError())}
        />
      )}

      <Formik
        onSubmit={setOffer}
        initialValues={{ offerData: '' }}
        validationSchema={validationSchema}
      >
        <Form className={styles.form}>
          {renderOfferInput()}
          <button type="submit" className={styles.btnOffer}>
            Send Offer
          </button>
        </Form>
      </Formik>
    </div>
  );
};

export default OfferForm;
