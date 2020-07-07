import onChange from 'on-change';
import updateValidationState from './validator';

const state = {
  form: {
    status: 'input',
    url: '',
    errors: {},
  },
  flows: {
    items: [],
  },
  links: {
    items: [],
  },
};

const form = document.querySelector('form');
const formInput = form.querySelector('input');
const formButton = form.querySelector('button');
const formMessage = document.getElementById('message');
const loadingButton = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
Loading...`;

export const watchedForm = onChange(state.form, (path) => {
  if (path === 'url') {
    const { status, errors } = updateValidationState(watchedForm);
    watchedForm.errors = errors;
    watchedForm.status = status;
  }
  if (path === 'status' && watchedForm.status === 'error') {
    formInput.classList.add('is-invalid');
    formButton.classList.add('disabled');
    formButton.innerHTML = 'Add';
    formMessage.innerHTML = watchedForm.errors.url.message;
    formMessage.classList.add('text-danger');
  }
  if (path === 'status' && watchedForm.status === 'input') {
    formInput.classList.remove('is-invalid');
    formButton.classList.remove('disabled');
    formMessage.innerHTML = 'Enter URL';
    formMessage.classList.remove('text-danger');
  }
  if (path === 'status' && watchedForm.status === 'loading') {
    formButton.classList.add('disabled');
    formButton.innerHTML = loadingButton;
    console.log(formButton);
  }
  if (path === 'status' && watchedForm.status === 'done') {
    formButton.classList.remove('disabled');
    formInput.value = '';
    formButton.innerHTML = 'Add';
  }
});

const rssFlows = document.getElementById('rss-items');
const getFlowDiv = ({ title, description }) => {
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');
  h2.innerHTML = title;
  p.innerHTML = description;
  div.append(h2, p);
  div.classList.add('alert', 'alert-info');
  return div;
};

export const watchedFlow = onChange(state.flows, (path, value) => {
  const flows = value.map((flowData) => getFlowDiv(flowData));
  rssFlows.innerHTML = '';
  rssFlows.append(...flows);
});

const rssLinks = document.getElementById('rss-links');
const getLinkDiv = ({
  title, description, publicDate, url,
}) => {
  const a = document.createElement('a');
  const h5 = document.createElement('h5');
  const p = document.createElement('p');
  const small = document.createElement('small');
  h5.innerHTML = title;
  p.innerHTML = description;
  small.innerHTML = publicDate;
  a.append(h5, p, small);
  a.setAttribute('href', url);
  a.classList.add('list-group-item', 'list-group-item-action');
  return a;
};

export const watchedLinks = onChange(state.links, (path, value) => {
  const links = value.map(getLinkDiv);
  rssLinks.innerHTML = '';
  rssLinks.append(...links);
});
