const parseFeed = (item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const [publicDate] = item.querySelector('pubDate').textContent.match(/^[A-Za-z]{3},\s\d{2}\s[A-Za-z]{3}\s\d{4}\s\d{2}:\d{2}/m);
  const [url] = item.textContent.match(/https:\/\/\S{1,}/m);
  return {
    title, description, publicDate, url,
  };
};

export default (data) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(data, 'text/xml');
    const title = doc.querySelector('title').textContent;
    const description = doc.querySelector('description').textContent;
    const posts = [...doc.getElementsByTagName('item')].slice(0, 10);
    const postsData = posts.map(parseFeed);
    return {
      title, description, postsData, parsererror: null,
    };
  } catch (e) {
    throw new Error('parse');
  }
};
