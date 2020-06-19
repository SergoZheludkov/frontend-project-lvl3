import watchedForm from './view';


const app = () => {
  const form = document.querySelector('form');
  form.elements.url.addEventListener('keyup', (event) => {
    watchedForm.url = event.target.value;
  });
};

export default app;
