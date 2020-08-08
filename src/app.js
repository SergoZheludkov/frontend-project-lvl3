import _ from 'lodash';
import i18next from 'i18next';
import getDataFromUrl from './getDataFromUrl';
import parser from './parser';
import {
  watchLang, watchForm, watchFlow, watchLinks,
} from './view';
import en from './locales/en.json';
import ru from './locales/ru.json';

const getFilterNewLinks = (linksData) => linksData
  .filter((link) => !_.find(watchLinks.items, { title: link.title }));

const getNumeretedLinksData = (flowId, linksData) => getFilterNewLinks(linksData)
  .map((linkData) => ({ id: _.uniqueId(), flowId, ...linkData }));

const updateData = (url) => getDataFromUrl(url)
  .then((res) => {
    const { title, description, itemsData } = parser(res.data);
    const flow = _.find(watchFlow.items, { title });

    if (flow) {
      watchLinks.items = [...getNumeretedLinksData(flow.id, itemsData), ...watchLinks.items];
    } else {
      const id = _.uniqueId();
      const flowData = {
        id, url, title, description,
      };
      watchFlow.items = [flowData, ...watchFlow.items];
      watchLinks.items = [...getNumeretedLinksData(id, itemsData), ...watchLinks.items];
    }
    setTimeout(() => updateData(url), 5000);
  });

const setLanguageListener = (language) => {
  const element = document.getElementById(language);
  element.addEventListener('click', (event) => {
    watchLang.type = event.target.id;
  });
};

const setLanguage = () => {
  i18next.init({
    lng: watchLang.type,
    debug: true,
    resources: {
      en,
      ru,
    },
  });

  const languages = ['ru', 'en'];
  languages.map(setLanguageListener);
};

const app = () => {
  setLanguage();

  const form = document.querySelector('form');
  form.elements.url.addEventListener('keyup', (event) => {
    watchForm.url = event.target.value;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (watchForm.status === 'error' || watchForm.status === 'loading') {
      return;
    }

    watchForm.status = 'loading';
    if (_.find(watchFlow.items, { url: watchForm.url })) {
      watchForm.errors = { url: { name: 'AddRssError' } };
      watchForm.status = 'error';
    } else {
      updateData(watchForm.url)
        .then(() => {
          watchForm.status = 'done';
        })
        .catch((e) => {
          watchForm.errors = { url: { name: 'RequestError' } };
          watchForm.status = 'error';
          throw new Error(e);
        });
    }
  });
};

export default app;
