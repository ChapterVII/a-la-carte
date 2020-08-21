const path = require('path');
const fs = require('fs');
const moment = require('moment');

const today = moment().format('YYYY-MM-DD');
exports.today = today;

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

const readMenuFile = () => {
  const data = fs.readFileSync(MenuJsonPath);
  if (data) {
    return JSON.parse(data);
  }
};

exports.readMenuFile = readMenuFile;

exports.checkTodayMenuCached = () => {
  const menu = readMenuFile();
  if (menu && menu.date === today) {
    return true;
  }
  return false;
}

exports.getMenuList = (menuMap) => {
  const menuList = [];
  if (!menuMap) {
    menuMap = readMenuFile();
  }
  Object.keys(menuMap).forEach(key => {
    if (key !== 'date') {
      const menus = menuMap[key];
      if (menus && menus.length) {
        menus.forEach(m => {
          menuList.push(m.name);
        })
      }
    }
  })
  return menuList;
}

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

exports.requiredConfigItems = ['company', 'dept', 'area'];

const configPath = path.resolve(__dirname, '../../alacarte.config.json');

exports.configPath = configPath;

exports.checkConfigExist = () => fs.existsSync(configPath);

exports.saveConfigFile = (data) => {
  const newData = JSON.stringify(data, '', '\t');
  fs.writeFile(configPath, newData, (err) => {
    if (err) {
      console.error(err);
    }
  })
};

exports.readConfigFile = () => {
  const data = fs.readFileSync(configPath);
  if (data) {
    return JSON.parse(data);
  }
};

const adminPath = path.resolve(__dirname, '../../alacarte.admin.json');
exports.adminPath = adminPath;
exports.checkAdminConfigExist = () => fs.existsSync(adminPath);

exports.saveAdminFile = (data) => {
  const newData = JSON.stringify(data, '', '\t');
  fs.writeFile(adminPath, newData, (err) => {
    if (err) {
      console.error(err);
    }
  })
};

exports.readAdminFile = () => {
  const data = fs.readFileSync(adminPath);
  if (data) {
    return JSON.parse(data);
  }
};