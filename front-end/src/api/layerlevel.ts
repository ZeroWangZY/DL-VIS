import axios from 'axios';

const URL_ROOT = ' ';

export  function fireAjax (method, URL, data) {
  if (method === 'POST') {
    return axios
      .post(URL_ROOT + URL, data)
      .then(({ data }) => ({ data: data.data }))
      .catch(error => {
        throw error;
      });
  } else if (method === 'GET') {
      //get
  }
}

export const fetchActivations = params => fireAjax('POST', '', params);