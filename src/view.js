import _ from 'lodash';
import onChange from 'on-change';
import i18next from 'i18next';
import * as yup from 'yup';

// ----------------------------------------------------------------------------------
const setMainText = (elem) => {
  const element = document.getElementById(elem);
  element.innerHTML = i18next.t(`main.${elem}`);
};

export const getLanguageWatcher = (languageState) => {
  const languageWatcher = onChange(languageState, (path, value) => {
    i18next.changeLanguage(languageWatcher.type);

    const langButtons = [...document.getElementsByTagName('label')];
    langButtons.map((button) => button.classList.remove('active'));
    const newActiveButton = document.getElementById(value);
    newActiveButton.classList.add('active');

    const mainElements = ['heading', 'description', 'message', 'button'];
    mainElements.map(setMainText);
  });
  return languageWatcher;
};
// ----------------------------------------------------------------------------------
const getFeedDiv = ({ title, description }) => {
  const div = document.createElement('div');
  const h2 = document.createElement('h2');
  const p = document.createElement('p');

  h2.innerHTML = title;
  p.innerHTML = description;
  div.append(h2, p);
  div.classList.add('alert', 'alert-info');
  return div;
};

export const getFeedsWatcher = (feedsState) => {
  const rssFeeds = document.getElementById('rss-feeds');
  return onChange(feedsState, (path, value) => {
    const feeds = value.map((feedData) => getFeedDiv(feedData));
    rssFeeds.innerHTML = '';
    rssFeeds.append(...feeds);
  });
};
// ----------------------------------------------------------------------------------
const getPostDiv = ({
  title, description, publicDate, url, feedId,
}, feedsData) => {
  const a = document.createElement('a');
  const h5 = document.createElement('h5');
  const p = document.createElement('p');
  const div = document.createElement('div');
  const date = document.createElement('small');
  const feedTitle = document.createElement('small');
  h5.innerHTML = title;
  p.innerHTML = description;
  date.innerHTML = publicDate;
  feedTitle.innerHTML = _.find(feedsData, { id: feedId }).title;

  div.append(date, feedTitle);
  div.classList.add('d-flex', 'justify-content-between');
  a.append(h5, p, div);
  a.setAttribute('href', url);
  a.classList.add('list-group-item', 'list-group-item-action');
  return a;
};

export const getPostsWatcher = (postsState, feedsWatcher) => {
  const rssPosts = document.getElementById('rss-posts');
  return onChange(postsState, (path, value) => {
    const posts = value.map((postData) => getPostDiv(postData, feedsWatcher.items));
    rssPosts.innerHTML = '';
    rssPosts.append(...posts);
  });
};
// ----------------------------------------------------------------------------------
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

export const gerFormWacher = (formState, feedsWatcher) => {
  const form = document.querySelector('form');
  const formInput = form.querySelector('input');
  const formButton = form.querySelector('button');
  const formMessage = document.getElementById('message');
  const loadingButton = `<span class="spinner-grow spinner-grow-sm" role="status" aria-hidden="true"></span>${i18next.t('main.loadingButton')}...`;

  const formWacher = onChange(formState, (path) => {
    if (path === 'url') {
      const urls = feedsWatcher.items.map(({ url }) => url);
      const { status, errors } = updateValidationState(formWacher, urls);
      formWacher.errors = errors;
      formWacher.status = status;
    }
    if (path === 'status' && formWacher.status === 'error') {
      formInput.classList.add('is-invalid');
      formButton.classList.add('disabled');
      formButton.innerHTML = i18next.t('main.button');
      const errorName = formWacher.errors.url.type;
      formMessage.innerHTML = i18next.t(`errors.${errorName}`);
      formMessage.classList.add('text-danger');
    }
    if (path === 'status' && formWacher.status === 'loading') {
      formButton.classList.add('disabled');
      formButton.innerHTML = loadingButton;
    }
    if (path === 'status' && formWacher.status === 'input') {
      formInput.classList.remove('is-invalid');
      formButton.classList.remove('disabled');
      formMessage.innerHTML = i18next.t('main.message');
      formMessage.classList.remove('text-danger');
      formButton.innerHTML = i18next.t('main.button');
      formInput.value = '';
      formWacher.url = '';
    }
  });
  return formWacher;
};
