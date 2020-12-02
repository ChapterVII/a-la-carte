const path = require('path');
const fs = require('fs');
const moment = require('moment');
const inquirer = require('inquirer');
const chalk = require('chalk');
const { queryCalendaritemsList } = require('../api/menu');

const dbPath = path.resolve(__dirname, '../../db');

exports.mkdirDb = () => {
  if (fs.existsSync(dbPath)) {
    return;
  }
  fs.mkdirSync(dbPath);
}

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
  if (!fs.existsSync(MenuJsonPath)) {
    return;
  }
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

exports.getMenuList = () => {
  const menuMap = readMenuFile();
  if (!menuMap || menuMap.date !== today) return;
  const menuList = [];
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

exports.renderMenuChoice = (menuMap) => {
  const choice = [];
  if (!menuMap) {
    menuMap = readMenuFile();
  }
  Object.keys(menuMap).forEach(key => {
    if (key !== 'date') {
      const menus = menuMap[key];
      if (menus && menus.length) {
        menus.forEach((m, i) => {
          if (i === 0) {
            choice.push(new inquirer.Separator(chalk.bgWhite.black(`【${(key)}】 \n`)));
          }
          choice.push(`${m.name} \n`);
        });
      }
    }
  })
  return choice;
}

const orderJsonPath = path.resolve(__dirname, '../../db/order.json');

exports.saveOrderFile = (data) => {
  const newData = JSON.stringify(data, '', '\t');
  fs.writeFileSync(orderJsonPath, newData);
};

const readOrderFile = () => {
  if (!fs.existsSync(orderJsonPath)) {
    return;
  }
  const data = fs.readFileSync(orderJsonPath);
  if (data) {
    return JSON.parse(data);
  }
};

exports.readOrderFile = readOrderFile;

exports.getOrderResFood = () => {
  const order = readOrderFile();
  if (!order || order.date !== today) {
    console.log('今日未下单！');
    return;
  }
  const menuMap = readMenuFile();
  if (!menuMap) {
    console.log('未获取到菜单文件！');
    return;
  }
  
  const resList = Object.keys(menuMap).filter(key => key !== 'date');
  const orderFood = order.food;
  for (let i = 0; i < resList.length; i++) {
    const resName = resList[i];
    const resMenu = menuMap[resName];
    if (Array.isArray(resMenu) && resMenu.length) {
      const target = resMenu.find(m => m.name === orderFood);
      if (target) {
        console.log(`今日订餐:\n${chalk.bgWhite.black(`【${(resName)}】\n`)}${orderFood}\n`);
        return;
      }
    }
  }
  console.log(`今日订餐: ${orderFood}`);
}

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

const readConfigFile = () => {
  if (!fs.existsSync(configPath)) {
    return;
  }
  const data = fs.readFileSync(configPath);
  if (data) {
    return JSON.parse(data);
  }
};

exports.readConfigFile = readConfigFile;

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
  if (!fs.existsSync(adminPath)) {
    return;
  }
  const data = fs.readFileSync(adminPath);
  if (data) {
    return JSON.parse(data);
  }
};

const defaultMotifyIconPath = path.resolve(__dirname, `../../images/notify-icon.jpg`);
const notifyIconName = `notify-icon-${today}.jpg`;
const notifyIconPath = path.resolve(__dirname, `../../images/${notifyIconName}`);

const removeInvalidNotifyIcon = () => {
  const dirPath = path.resolve(__dirname, `../../images`);
  if( fs.existsSync(dirPath) ) {
    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      if (file !== 'notify-icon.jpg' && file !== notifyIconName) {
        fs.unlink(path.join(dirPath, file), (err) => {
          console.log(`notifyIcon: ${file} 删除${err ? '失败 ' + err : '成功'}`);
        });
      }
    })
  }
}

exports.saveNotifyIcon = data => new Promise((resolve) => {
  try {
    const stream = data.pipe(fs.createWriteStream(notifyIconPath));
    stream.on('finish', function () {
      removeInvalidNotifyIcon();
      resolve('success');
    });
  } catch (e) {
    console.log('图片保存失败：: ', e);
    resolve('failed');
  }
});

const checkTodayNotifyIcon = () => {
  return fs.existsSync(notifyIconPath);
}

exports.checkTodayNotifyIcon = checkTodayNotifyIcon;

exports.getValidNotifyIconPath = () => {
  if (checkTodayNotifyIcon()) {
    return notifyIconPath;
  }
  return defaultMotifyIconPath;
};

const getCommonHeaders = () => {
  const config = readConfigFile();
  if (!config || !config.menu) {
    return;
  }
  
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    'cookie': config.menu.cookie,
  }
};

exports.getCommonHeaders = getCommonHeaders;

exports.mayIOrder = async () => {
  const startTime = moment().format("YYYY-MM-DD 10:30:00");
  const current = moment();
  const endTime = moment().format("YYYY-MM-DD 15:30:00");
  const alarmTime = moment().format("YYYY-MM-DD 14:00:00");
  if (current.isBefore(startTime)) {
    return {
      status: false,
      msg: '来早啦，10:30开始订餐！',
    };
  }
  if (current.isAfter(endTime)) {
    return {
      status: false,
      msg: '来晚咯，商家已收单！',
    };
  }
  if (current.isBefore(alarmTime)) {
    return {
      status: true,
    };
  }
  try {
    const res = await queryCalendaritemsList(getCommonHeaders(), {
      beginDate: today,
      endDate: today
    });
    if (res && res.dateList && res.dateList[0]) {
      const targetCalendarItem = res.dateList[0].calendarItemList;
      if (targetCalendarItem && targetCalendarItem[0] && targetCalendarItem[0].status) {
        if (targetCalendarItem[0].status === 'AVAILABLE') {
          return {
            status: true,
          }
        }
        if (targetCalendarItem[0].status === 'ORDER') {
          return {
            status: 'ORDER',
            msg: '订餐时间过晚，第三方APP已下单，订餐成功后请尽快联系管理员手动增加！',
          };
        }
      }
    }
    
    return {
      status: false,
      msg: '获取订餐状态失败，请联系管理员!',
    };
  } catch (e) {
    console.log('error: ', e);
    return {
      status: false,
      msg: '获取订餐状态失败，请联系管理员!',
    };
  }
}