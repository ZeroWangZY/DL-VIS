import axios from 'axios';
import qs from 'qs'

const URL_ROOT = '';

export default function fireAjax(method, URL, data?) {
  if (method === 'POST') {
    return axios
      .post(URL_ROOT + URL, data)
      .then(({ data }) => ({ data: data }))
      .catch(error => {
        throw error;
      });
  } else if (method === 'GET') {
    return axios
      .get(URL_ROOT + URL, {
        params: {
          ...data
        },
        paramsSerializer: params => {
          return qs.stringify(params, { indices: false })
        }
      })
      .then(({ data }) => ({ data: data }))
      .catch(error => {
        throw error;
      });
  }
}
