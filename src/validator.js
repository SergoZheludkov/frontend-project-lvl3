import * as yup from 'yup';
import _ from 'lodash';


const getSchema = (urls) => yup.object().shape({
  url: yup.string().url()
    .notOneOf(urls),
});

const updateValidationState = (form, urls) => {
  try {
    const schema = getSchema(urls);
    schema.validateSync(form, { abortEarly: false });
    return { status: 'input', errors: null };
  } catch (e) {
    const errors = _.keyBy(e.inner, 'path');
    return { status: 'error', errors };
  }
};

export default updateValidationState;
