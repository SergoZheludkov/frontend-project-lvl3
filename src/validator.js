/* eslint no-param-reassign: ["error", { "props": false }] */
import * as yup from 'yup';
import _ from 'lodash';

const schema = yup.object().shape({
  url: yup.string().url(),
});

const updateValidationState = (form) => {
  try {
    schema.validateSync(form, { abortEarly: false });
    return true;
  } catch (e) {
    const errors = _.keyBy(e.inner, 'path');
    // console.log(errors);
    form.errors = errors;
    return false;
  }
};

export default updateValidationState;
