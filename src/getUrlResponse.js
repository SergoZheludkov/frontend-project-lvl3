import axios from 'axios';

const proxy = 'https://cors-anywhere.herokuapp.com/';

export default (url) => {
  const proxyUrl = `${proxy}${url}`;
  return axios.get(proxyUrl);
};
