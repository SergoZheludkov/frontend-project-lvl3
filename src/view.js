import onChange from 'on-change';
import updateValidationState from './validator';

const state = {
  form: {
    url: '',
    validate: true,
    errors: {},
  },
  flows: {
    items: [],
  },
  links: {
    items: [],
  },
  urls: [],
};

const form = document.querySelector('form');
const formInput = form.querySelector('input');
const formButton = form.querySelector('button');
const formMessage = document.getElementById('message');

export const watchedForm = onChange(state.form, (path) => {
  if (path === 'url') {
    const { validate, errors } = updateValidationState(watchedForm);
    watchedForm.errors = errors;
    watchedForm.validate = validate;
  }
  if (path === 'validate' && !watchedForm.validate) {
    formInput.classList.add('is-invalid');
    formButton.classList.add('disabled');
    formMessage.innerHTML = watchedForm.errors.url.message;
  }
  if (path === 'validate' && watchedForm.validate) {
    formInput.classList.remove('is-invalid');
    formButton.classList.remove('disabled');
    formMessage.innerHTML = 'Enter URL';
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

export const wachedLinks = onChange(state.links, (path, value) => {
  const links = value.slice(0, 10).map(getLinkDiv);
  rssLinks.innerHTML = '';
  rssLinks.append(...links);
});
