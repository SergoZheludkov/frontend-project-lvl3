import _ from 'lodash';
import { watchedForm, watchedFlow, watchedLinks } from './view';
import getDataFromUrl from './getDataFromUrl';
import parser from './parser';

const getFilterNewLinks = (linksData) => linksData
  .filter((link) => !_.find(watchedLinks.items, { title: link.title }));

const getNumeretedLinksData = (flowId, linksData) => getFilterNewLinks(linksData)
  .map((linkData) => ({ id: _.uniqueId(), flowId, ...linkData }));

const getData = (url) => getDataFromUrl(url)
  .then((res) => {
    const {
      title, description, itemsData,
    } = parser(res.data);

    const flow = _.find(watchedFlow.items, { title });
    if (flow) {
      watchedLinks.items = [...getNumeretedLinksData(flow.id, itemsData), ...watchedLinks.items];

      const date = new Date();
      console.log('flow id:', flow.id, '\ndate:', date, '\n', getNumeretedLinksData(flow.id, itemsData));
    } else {
      const id = _.uniqueId();
      const flowData = {
        id, url, title, description,
      };

      watchedFlow.items = [flowData, ...watchedFlow.items];
      watchedLinks.items = [...getNumeretedLinksData(id, itemsData), ...watchedLinks.items];
    }
  });

const app = () => {
  const form = document.querySelector('form');
  let intervalId;

  form.elements.url.addEventListener('keyup', (event) => {
    watchedForm.url = event.target.value;
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (watchedForm.status === 'error' || watchedForm.status === 'loading') {
      return;
    }

    watchedForm.status = 'loading';
    if (_.find(watchedFlow.items, { url: watchedForm.url })) {
      watchedForm.errors = { url: { name: 'AddRssError', message: 'This RSS has already been added' } };
      watchedForm.status = 'error';
    } else {
      getData(watchedForm.url)
        .then(() => {
          watchedForm.status = 'done';
          clearInterval(intervalId);
          intervalId = setInterval(() => watchedFlow.items.map(({ url }) => getData(url)), 60000);
        })
        .catch((e) => {
          watchedForm.errors = { url: { name: 'RequestError', message: 'Client network error. Please check your URL.' } };
          watchedForm.status = 'error';
          throw new Error(e);
        });
    }
  });
};

export default app;
