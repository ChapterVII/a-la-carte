const axios = require('../http');
const utils =require('../utils');

exports.getUnsplashImg = () =>{
  return new Promise(resolve => {
    axios({
      method: "get",
      url: 'https://source.unsplash.com/300x300/?food',
      responseType:'stream',
    }).then(async (data) => {
      const res = await utils.saveNotifyIcon(data);
      resolve(res);
    }).catch(e => {
      console.log('图片获取失败：', e);
      resolve('failed');
    })
  });
}