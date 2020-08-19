const axios = require('../http');
const { order } = require('../../config');
const { members } = require('../../administrator');
const { today } =require('../utils');

const {baseUrl, commonPath, area, dept, version} = order;

const PATH_MAP = {
  ADD: `${baseUrl}${commonPath}add`,
  DELETE: `${baseUrl}${commonPath}delete`,
  LIST: `${baseUrl}${commonPath}list`,
};

exports.addOrder = (data) => {
  return axios({
    method: "post",
    url: PATH_MAP.ADD,
    params: {
      area,
      dept,
      gpclVersion: version,
      sourcePage: "add",
      ...data,
    },
  });
};

exports.delOrder = (id) => {
  return axios({
    method: "get",
    url: PATH_MAP.DELETE,
    params: {
      id,
      gpclVersion: version,
    },
  });
};

const queryOrderList = () => {
  return axios({
    method: "get",
    url: PATH_MAP.LIST,
    params: {
      pageNum: 1,
      pageSize: 1000,
      bookDate__sd: today,
      bookDate__ed: today,
      gpclVersion: version,
      sourcePage: 'list',
    },
  });
};

exports.queryTeamOrderList = async () => {
  const res = await queryOrderList();
  if (res && res.list) {
    if (res.list.length === 0) {
      return [];
    } else {
      return res.list.filter(i => i.dept === dept && members.includes(i.name));
    }
  }
  console.error('Get Team OrderList Faild!');
  return [];
};