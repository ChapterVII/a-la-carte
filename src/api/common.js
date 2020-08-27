const axios = require('../http');

exports.getUserConfig = (server) =>{
  return new Promise(resolve => {
    axios({
      method: "get",
      url: `http://${server}/userConfig`,
    }).then(res => {
      if (res.status === 'successed') {
        resolve(res.data);
      } else if (res.status === 'failed'){
        console.error(res.message || '请联系管理员');
        resolve();
      }
    }).catch(e => {
      console.error('请联系管理员: ', e);
      resolve();
    })
  });
}