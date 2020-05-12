import axios from 'axios';

const URL_ROOT = '';

export default function fireAjax (method, URL, data?) {
  if (method === 'POST') {
    return axios
      .post(URL_ROOT + URL, data)
      .then(({ data }) => ({ data: data }))
      .catch(error => {
        throw error;
      });
  } else if (method === 'GET') {
      return axios
      .get(URL_ROOT + URL, data)
      .then(({ data }) => ({ data: data }))
      .catch(error => {
        throw error;
      });
  }
}