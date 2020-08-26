const inquirer = require('inquirer');
const ora = require('ora');
const { getConfig } = require('../src/order');
const { saveAdminFile } = require('../src/utils');

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
    message: 'Please enter team members',
    name: 'members',
    validate: (val) => {
      const arr = val.split(' ');
      for (let i = 0; i < arr.length; i++) {
        if (!/^[\u4e00-\u9fa5]{2,}$/.test(arr[i])) {
          return "格式错误";
        }
      }
      return true;
    }
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
      type: 'rawlist',
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
  const inputInfo = await promptInputInfo();
  if (!inputInfo) {
    return;
  }

  const spinner = ora('拉取配置选项...');
  spinner.start();
  const config = await getConfig();
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
  saveAdminFile(obj);
  inquirer
    .prompt([{
      type: 'confirm',
      message: '是否开启订餐统计自动推送？',
      name: 'notify',
      default: true,
    }])
    .then(answers => {
      if (answers && answers.notify) {
        const { scheduleStatisticNotify } = require('./scheduler');
        scheduleStatisticNotify();
      }
    })
    .catch(error => {
      console.error('error: ', error);
    });
}



