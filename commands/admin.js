const inquirer = require('inquirer');
const ora = require('ora');
const order = require('../src/order');
const utils = require('../src/utils');

const promptInputInfo = () => new Promise(resolve => {
  const promptList = [{
    type: 'input',
    message: '请输入ID',
    name: 'id',
  },{
    type: 'password',
    message: 'Please enter your password',
    name: 'password',
    validate: (val) => {
      if (val !== '123456') {
        return "密码错误";
      }
      return true;
    }
  },{
    type: 'input',
    message: 'Please enter your robot',
    name: 'robot',
  },{
    type: 'input',
    message: 'Please enter clientId',
    name: 'clientId',
  },{
    type: 'input',
    message: 'Please enter clientSecret',
    name: 'clientSecret',
  // },{
  //   type: 'input',
  //   message: 'Please enter team members',
  //   name: 'members',
  //   validate: (val) => {
  //     const arr = val.split(' ');
  //     for (let i = 0; i < arr.length; i++) {
  //       if (!/^[\u4e00-\u9fa5]{2,}$/.test(arr[i])) {
  //         return "格式错误";
  //       }
  //     }
  //     return true;
  //   }
  }];
  inquirer
    .prompt(promptList)
    .then(answers => {
      resolve(answers);
    })
    .catch(error => {
      console.error('error: ', error);
      resolve();
    });
});

const promptSelectInfo = (config) => new Promise(resolve => {
  const promptList = ['dept'].map(i => {
    const {label, options} = config[i];
    return {
      type: 'list',
      message: `请选择 ${label}`,
      name: i,
      choices: options.map(v => ({
        name: v.text,
        value: v.value,
      })),
    };
  });

  inquirer
    .prompt(promptList)
    .then(answers => {
      resolve(answers);
    })
    .catch(error => {
      console.error('error: ', error);
      resolve();
    });
});

module.exports = async () => {
  if (!utils.checkConfigExist()) {
    console.error('配置文件缺失，请先执行alacarte init');
    return;
  }
  const inputInfo = await promptInputInfo();
  if (!inputInfo) {
    return;
  }

  const spinner = ora('拉取配置选项...');
  spinner.start();
  const config = await order.getConfig();
  spinner.succeed();
  if (!config) {
    console.error('Failed!');
    return;
  }

  const selectInfo = await promptSelectInfo(config);
  if (!selectInfo) {
    return;
  }
  
  const obj = {
    ...inputInfo,
    ...selectInfo,
  };
  utils.saveAdminFile(obj);
  inquirer
    .prompt([{
      type: 'confirm',
      message: '是否开启订餐统计自动推送？',
      name: 'statistic',
      default: true,
    }, {
      type: 'confirm',
      message: '是否开启核对补餐自动推送？',
      name: 'check',
      default: true,
    }])
    .then(async answers => {
      if (answers) {
        const { scheduleStatisticNotify, scheduleCheckNotify } = require('./scheduler');
        if (answers.statistic) {
          await scheduleStatisticNotify();
        }
        if (answers.check) {
          await scheduleCheckNotify();
        }
        console.log('admin 权限配置成功~！');
      }
    })
    .catch(error => {
      console.error('error: ', error);
    });
}



