import React from 'react';
import { Field, ErrorMessage } from 'formik';
import classNames from 'classnames';

const FormInput = ({ classes, label, name, showError = true, ...rest }) => (
  <Field name={name}>
    {({ field, meta: { touched, error } }) => {
      const inputClassName = classNames(classes.input, {
        [classes.notValid]: touched && error,
        [classes.valid]: touched && !error,
      });

      return (
        <div className={classes.container}>
          <input
            {...field}
            {...rest}
            placeholder={label}
            className={inputClassName}
          />
          {showError && (
            <ErrorMessage
              name={name}
              component="span"
              className={classes.warning}
            />
          )}
        </div>
      );
    }}
  </Field>
);

export default FormInput;
