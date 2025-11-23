import { Formik, Form, Field, ErrorMessage } from 'formik';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Schemas from '../../utils/validators/validationSchems';
import styles from './events.module.sass';

const EventForm = ({ onAdd }) => {
  const REMIND_OPTIONS = [
    { value: '5m', label: '5 minutes' },
    { value: '10m', label: '10 minutes' },
    { value: '30m', label: '30 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '2h', label: '2 hours' },
    { value: '1d', label: '1 day' },
  ];

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
          toast.error('Choose time in the future');
          return;
        }

        let minutes = 0;
        switch (remindBefore.slice(-1)) {
          case 'm':
            minutes = parseInt(remindBefore, 10);
            break;
          case 'h':
            minutes = parseInt(remindBefore, 10) * 60;
            break;
          case 'd':
            minutes = parseInt(remindBefore, 10) * 1440;
            break;
          default:
            minutes = 0;
        }

        const notifyTime = dateTime - minutes * 60000;

        if (notifyTime <= new Date()) {
          toast.error('Remind time must be in the future');
          return;
        }

        const newEvent = {
          id: Date.now(),
          name,
          dateTime: dateTime.toISOString(),
          remindBefore: minutes,
          createdAt: new Date().toISOString(),
        };

        onAdd(newEvent);
        resetForm();
        toast.success('Event added successfully!');
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
                {REMIND_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
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
