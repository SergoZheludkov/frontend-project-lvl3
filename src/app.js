import i18next from 'i18next';
import axios from 'axios';
import _ from 'lodash';
import parser from './parser';
import en from './locales/en.json';
import ru from './locales/ru.json';
import {
  getLanguageWatcher, gerFormWacher, getFeedsWatcher, getPostsWatcher,
} from './view';

const timeToNextUpdate = 60000;
// ----------------------------------------------------------------------------------
const proxy = 'https://cors-anywhere.herokuapp.com/';
const getDataFromUrl = (url) => {
  const proxyUrl = `${proxy}${url}`;
  return axios.get(proxyUrl);
};
// ----------------------------------------------------------------------------------
const checkTitle = ({ title: inspect }, { title: exclude }) => inspect === exclude;

const getNumeretedPostsData = (feedId, postsData) => postsData
  .map((postData) => ({ id: _.uniqueId(), feedId, ...postData }));

const updateData = (url, feedsWatch, postsWatch) => getDataFromUrl(url)
  .then((res) => {
    const feedsWatcher = feedsWatch;
    const postsWatcher = postsWatch;
    const { title, description, postsData } = parser(res.data);
    const feed = _.find(feedsWatcher.items, { title });

    if (feed) {
      const newPosts = _.differenceWith(postsData, postsWatcher.items, checkTitle);
      postsWatcher.items = [...getNumeretedPostsData(feed.id, newPosts), ...postsWatcher.items];
    } else {
      const id = _.uniqueId();
      const newFeedData = {
        id, url, title, description,
      };
      feedsWatcher.items = [newFeedData, ...feedsWatcher.items];
      postsWatcher.items = [...getNumeretedPostsData(id, postsData), ...postsWatcher.items];
    }
    setTimeout(() => updateData(url, feedsWatcher, postsWatcher), timeToNextUpdate);
  });
// ----------------------------------------------------------------------------------
const setLanguageListener = (language, langWatch) => {
  const languageWatcher = langWatch;
  const element = document.getElementById(language);
  element.addEventListener('click', (event) => {
    languageWatcher.type = event.target.id;
  });
};

const setLanguage = (languageWatcher) => {
  i18next.init({
    lng: languageWatcher.type,
    debug: true,
    resources: {
      en,
      ru,
    },
  });
};
// ----------------------------------------------------------------------------------
const app = () => {
  const state = {
    language: {
      type: 'en',
    },
    form: {
      status: 'input',
      url: '',
      errors: {},
    },
    feeds: {
      items: [],
    },
    posts: {
      items: [],
    },
  };

  const languages = ['ru', 'en'];
  const languageWatcher = getLanguageWatcher(state.language);
  setLanguage(languageWatcher);
  languages.map((lang) => setLanguageListener(lang, languageWatcher));

  const feedsWatcher = getFeedsWatcher(state.feeds);
  const postsWatcher = getPostsWatcher(state.posts, feedsWatcher);
  const formWatcher = gerFormWacher(state.form, feedsWatcher);

  const form = document.querySelector('form');
  form.elements.url.addEventListener('keyup', (event) => {
    formWatcher.url = event.target.value;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (formWatcher.status === 'error' || formWatcher.status === 'loading') {
      return;
    }

    formWatcher.status = 'loading';
    updateData(formWatcher.url, feedsWatcher, postsWatcher)
      .then(() => {
        formWatcher.status = 'input';
      })
      .catch((e) => {
        formWatcher.errors = { url: { type: e.message || 'request' } };
        formWatcher.status = 'error';
        throw new Error(e);
      });
  });
};

export default app;
