import { watchedForm, watchedFlow, watchedLinks } from './view';
import getUrlResponse from './getUrlResponse';
import parser from './parser';

const app = () => {
  const form = document.querySelector('form');

  form.elements.url.addEventListener('keyup', (event) => {
    watchedForm.url = event.target.value;
  });

  const urls = [];

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedForm.status = 'loading';
    getUrlResponse(watchedForm.url)
      .then((res) => {
        if (urls.includes(watchedForm.url)) {
          watchedForm.errors = { url: { name: 'AddRssError', message: 'This RSS has already been added' } };
          watchedForm.status = 'error';
        } else {
          const {
            id, title, description, itemsData,
          } = parser(res.data);
          watchedForm.status = 'done';
          watchedFlow.items = [...watchedFlow.items, { id, title, description }];
          watchedLinks.items = [...watchedLinks.items, ...itemsData];
          urls.push(watchedForm.url);
          watchedForm.status = 'input';
        }
      })
      .catch((e) => {
        watchedForm.errors = { url: { name: 'RequestError', message: 'Client network error. Please check your URL.' } };
        watchedForm.status = 'error';
        throw new Error(e);
      });
  });
};

export default app;
