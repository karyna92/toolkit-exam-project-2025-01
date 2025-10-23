import React, { forwardRef } from 'react';
import classNames from 'classnames';
import MaskedInput from 'react-text-mask';
import { useField } from 'formik';

const PayInput = forwardRef((props, ref) => {
  const { label, changeFocus, classes, isInputMask, maskType } = props;
  const [field, meta] = useField(props.name);
  const { touched, error } = meta;

  const inputProps = {
    ...field,
    placeholder: label,
    className: classNames(classes.input, {
      [classes.notValid]: touched && error,
    }),
    onFocus: () => changeFocus && changeFocus(field.name),
    ref,
  };

  const masks = {
    cardNumber: [
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      ' ',
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      ' ',
      /\d/,
      /\d/,
      /\d/,
      /\d/,
      ' ',
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
    expiry: [/\d/, /\d/, '/', /\d/, /\d/],
    cvc: [/\d/, /\d/, /\d/],
  };

  if (field.name === 'sum') {
    return (
      <div className={classes.container}>
        <input {...inputProps} />
        {touched && error && (
          <span className={classes.error}>{error.message}!</span>
        )}
      </div>
    );
  }

  if (isInputMask) {
    return (
      <div className={classes.container}>
        <MaskedInput
          mask={masks[maskType] || []} 
          {...inputProps}
        />
        {touched && error && (
          <span className={classes.error}>{error.message}!</span>
        )}
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <input {...inputProps} />
      {touched && error && (
        <span className={classes.error}>{error.message}!</span>
      )}
    </div>
  );
});

export default PayInput;

