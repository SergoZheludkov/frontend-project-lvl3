import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import updateValidationState from './validator';

const state = {
  language: {
    type: 'en',
  },
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


const setMainText = (elem) => {
  const element = document.getElementById(elem);
  element.innerHTML = i18next.t(`main.${elem}`);
};

export const watchLang = onChange(state.language, (path, value) => {
  i18next.changeLanguage(watchLang.type);

  const langButtons = [...document.getElementsByTagName('label')];
  langButtons.map((button) => button.classList.remove('active'));
  const newActiveButton = document.getElementById(value);
  newActiveButton.classList.add('active');

  const mainElements = ['heading', 'description', 'message', 'button'];
  mainElements.map(setMainText);
});


export const watchForm = onChange(state.form, (path) => {
  if (path === 'url') {
    const { status, errors } = updateValidationState(watchForm);
    watchForm.errors = errors;
    watchForm.status = status;
  }
  if (path === 'status' && watchForm.status === 'error') {
    console.log(watchForm.errors);
    formInput.classList.add('is-invalid');
    formButton.classList.add('disabled');
    formButton.innerHTML = i18next.t('main.button');
    const errorName = _.camelCase(watchForm.errors.url.name);
    formMessage.innerHTML = i18next.t(`errors.${errorName}`);
    formMessage.classList.add('text-danger');
  }
  if (path === 'status' && watchForm.status === 'loading') {
    formButton.classList.add('disabled');
    const loadingButton = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>
    ${i18next.t('main.loadingButton')}...`;
    formButton.innerHTML = loadingButton;
  }
  if (path === 'status' && watchForm.status === 'done') {
    formButton.classList.remove('disabled');
    formInput.value = '';
    formButton.innerHTML = i18next.t('main.button');
  }
  if (path === 'status' && watchForm.status === 'input') {
    formInput.classList.remove('is-invalid');
    formButton.classList.remove('disabled');
    formMessage.innerHTML = i18next.t('main.message');
    formMessage.classList.remove('text-danger');
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

export const watchFlow = onChange(state.flows, (path, value) => {
  const flows = value.map((flowData) => getFlowDiv(flowData));
  rssFlows.innerHTML = '';
  rssFlows.append(...flows);
});

const rssLinks = document.getElementById('rss-links');
const getLinkDiv = ({
  title, description, publicDate, url, flowId,
}, flowsData) => {
  const a = document.createElement('a');
  const h5 = document.createElement('h5');
  const p = document.createElement('p');
  const div = document.createElement('div');
  const date = document.createElement('small');
  const flowTitle = document.createElement('small');

  h5.innerHTML = title;
  p.innerHTML = description;
  date.innerHTML = publicDate;
  flowTitle.innerHTML = _.find(flowsData, { id: flowId }).title;

  div.append(date, flowTitle);
  div.classList.add('d-flex', 'justify-content-between');
  a.append(h5, p, div);
  a.setAttribute('href', url);
  a.classList.add('list-group-item', 'list-group-item-action');
  return a;
};

export const watchLinks = onChange(state.links, (path, value) => {
  const links = value.map((linkData) => getLinkDiv(linkData, state.flows.items));
  rssLinks.innerHTML = '';
  rssLinks.append(...links);
});
