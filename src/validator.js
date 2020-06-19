import * as yup from 'yup';
import _ from 'lodash';

const schema = yup.object().shape({
  url: yup.string().url(),
});

const updateValidationState = (form) => {
  try {
    schema.validateSync(form, { abortEarly: false });
    return { validate: true, errors: null };
  } catch (e) {
    const errors = _.keyBy(e.inner, 'path');
    return { validate: false, errors };
  }
};

export default updateValidationState;
