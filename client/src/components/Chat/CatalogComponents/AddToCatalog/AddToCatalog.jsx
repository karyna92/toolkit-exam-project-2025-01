import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import SelectInput from '../../../SelectInput/SelectInput';
import { addChatToCatalog } from '../../../../store/slices/chatSlice';
import styles from './AddToCatalog.module.sass';

const AddToCatalog = () => {
  const dispatch = useDispatch();
  const { catalogList, addChatId } = useSelector((state) => state.chatStore);

  const getCatalogsNames = () => {
    const namesArray = [];
    catalogList.forEach((catalog) => {
      namesArray.push(catalog.catalogName);
    });
    return namesArray;
  };

  const getValueArray = () => {
    const valueArray = [];
    catalogList.forEach((catalog) => {
      valueArray.push(catalog.id);
    });
    return valueArray;
  };

  const handleSubmit = (values) => {
    if (!addChatId) {
      console.error('addChatId is missing - no chat selected');
      return;
    }
    dispatch(addChatToCatalog({ chatId: addChatId, catalogId: values.catalogId }));
  };

  const selectArray = getCatalogsNames();
  
  return (
    <>
      {selectArray.length !== 0 ? (
        <Formik onSubmit={handleSubmit} initialValues={{ catalogId: '' }}>
          <Form className={styles.form}>
            <SelectInput
              name="catalogId"
              header="name of catalog"
              classes={{
                inputContainer: styles.selectInputContainer,
                inputHeader: styles.selectHeader,
                selectInput: styles.select,
              }}
              optionsArray={selectArray}
              valueArray={getValueArray()}
            />
            <button type="submit">Add</button>
          </Form>
        </Formik>
      ) : (
        <div className={styles.notFound}>
          You have not created any directories.
        </div>
      )}
    </>
  );
};

export default AddToCatalog;