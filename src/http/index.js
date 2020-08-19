const Axios = require('axios');

Axios.interceptors.response.use(
  (res) => {
    const { data } = res;
    return data;
  },
  (err) => {
    return Promise.reject(err);
  },
);

module.exports = Axios;