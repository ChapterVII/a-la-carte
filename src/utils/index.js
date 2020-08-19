const path = require('path');
const fs = require('fs');
const moment = require('moment');

exports.today = moment().format('YYYY-MM-DD');
exports.meicanEndTime = moment().format('YYYY-MM-DD 15:30');

const MenuJsonPath = path.resolve(__dirname, '../../db/menu.json');

exports.saveMenuFile = (data) => {
  const newData = JSON.stringify(data, '', '\t');
  fs.writeFile(MenuJsonPath, newData, (err) => {
    if (err) {
      console.error(err);
    }
  })
};

exports.readMenuFile = () => {
  const data = fs.readFileSync(MenuJsonPath);
  if (data) {
    return JSON.parse(data);
  }
};

const orderJsonPath = path.resolve(__dirname, '../../db/order.json');

exports.saveOrderFile = (data) => {
  const newData = JSON.stringify(data, '', '\t');
  fs.writeFile(orderJsonPath, newData, (err) => {
    if (err) {
      console.error(err);
    }
  })
};

exports.readOrderFile = () => {
  const data = fs.readFileSync(orderJsonPath);
  if (data) {
    return JSON.parse(data);
  }
};