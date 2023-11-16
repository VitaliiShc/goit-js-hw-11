import axios from 'axios';

const URL = "https://pixabay.com/api/";
const KEY = '40714331-797d4279a84dd1dec86e8ae31';

export async function fetchImgs(q, page, per_page) {
  const url = `${URL}?key=${KEY}&q=${q}&page=${page}&per_page=${per_page}&image_type=photo&orientation=horizontal&safesearch=true`;
  const response = await axios.get(url);
  return response.data;
};