import { Formik, Form, Field, ErrorMessage } from 'formik';
import Schemas from '../../utils/validators/validationSchems';
import styles from './events.module.sass';

const EventForm = ({ onAdd }) => {
  return (
    <Formik
      initialValues={{
        name: '',
        date: '',
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        remindBefore: '30m',
        notify: false,
      }}
      validationSchema={Schemas.EventFormSchema}
      onSubmit={(values, { resetForm }) => {
        const { name, date, time, remindBefore } = values;
        const dateTime = new Date(`${date}T${time}`);

        if (dateTime <= new Date()) {
          alert('Choose time in the future');
          return;
        }

        let minutes;
        if (remindBefore.endsWith('m')) {
          minutes = parseInt(remindBefore, 10);
        } else if (remindBefore.endsWith('h')) {
          minutes = parseInt(remindBefore, 10) * 60;
        } else if (remindBefore.endsWith('d')) {
          minutes = parseInt(remindBefore, 10) * 1440;
        }

        const newEvent = {
          id: Date.now(),
          name,
          dateTime: dateTime.toISOString(),
          remindBefore: minutes,
        };

        onAdd(newEvent);
        resetForm();
      }}
    >
      {() => (
        <Form className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Event Name
            </label>
            <div className={styles.inputPart}>
              <Field
                id="name"
                type="text"
                name="name"
                placeholder="Event name"
                className={styles.input}
              />
              <ErrorMessage
                name="name"
                component="div"
                className={styles.error}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="date" className={styles.label}>
              Date
            </label>
            <div className={styles.inputPart}>
              <Field
                id="date"
                name="date"
                type="text"
                placeholder="Event date"
                className={styles.input}
                onFocus={(e) => {
                  e.target.type = 'date';
                  e.target.showPicker?.();
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = 'text';
                  }
                }}
              />
              <ErrorMessage
                name="date"
                component="div"
                className={styles.error}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="time" className={styles.label}>
              Time
            </label>
            <div className={styles.inputPart}>
              <Field
                id="time"
                name="time"
                type="text"
                placeholder="Event time"
                className={styles.input}
                onFocus={(e) => {
                  e.target.type = 'time';
                  e.target.showPicker?.();
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = 'text';
                  }
                }}
              />
              <ErrorMessage
                name="time"
                component="div"
                className={styles.error}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="remindBefore" className={styles.label}>
              Remind Before
            </label>
            <div className={styles.inputPart}>
              <Field
                as="select"
                id="remindBefore"
                name="remindBefore"
                className={`${styles.input} ${styles.selectInput}`}
              >
                <option value="5m">5 minutes</option>
                <option value="10m">10 minutes</option>
                <option value="30m">30 minutes</option>
                <option value="1h">1 hour</option>
                <option value="2h">2 hours</option>
                <option value="1d">1 day</option>
              </Field>
              <ErrorMessage
                name="remindBefore"
                component="div"
                className={styles.error}
              />
            </div>
          </div>

          <button type="submit" className={styles.button}>
            Add event
          </button>
        </Form>
      )}
    </Formik>
  );
};

export default EventForm;
