import { watchedForm, watchedFlow, wachedLinks } from './view';
import getRSSdata from './getRSSdata';
import parser from './parser';


const app = () => {
  const form = document.querySelector('form');
  form.elements.url.addEventListener('keyup', (event) => {
    watchedForm.url = event.target.value;
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    getRSSdata(watchedForm.url)
      .then((data) => {
        const { title, description, itemsData } = parser(data);
        watchedFlow.items = [...watchedFlow.items, { title, description }];
        wachedLinks.items = [...wachedLinks.items, ...itemsData];
      });
  });
};

export default app;
