const inquirer = require('inquirer');
const ora = require('ora');
const { getConfig } = require('../src/order');
const { requiredConfigItems, saveConfigFile } = require('../src/utils');

const promptInputInfo = () => new Promise(resolve => {
  const promptList = [{
    type: 'input',
    message: '请输入姓名（中文）',
    name: 'name',
    validate: (val) => {
      if (!/^[\u4e00-\u9fa5]{2,}$/.test(val)) {
        return "请输入中文姓名";
      }
      return true;
  }
  },{
    type: 'input',
    message: 'Please enter your cookie:',
    name: 'cookie',
  },{
    type: 'input',
    message: 'Please enter baseUrl:',
    name: 'baseUrl',
  },{
    type: 'input',
    message: 'Please enter commonPath:',
    name: 'commonPath',
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
  const promptList = requiredConfigItems.map(i => {
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
  const config = await getConfig(inputInfo);
  spinner.succeed();
  if (!config) {
    console.error('Failed!');
    return;
  }

  const selectInfo = await promptSelectInfo(config);
  if (!selectInfo) {
    return;
  }

  const { cookie, ...rest } = inputInfo;
  const obj = {
    menu: {
      cookie,
    },
    order: {
      ...rest,
      ...selectInfo,
      version: config.version,
    }
  };
  saveConfigFile(obj);
  inquirer
    .prompt([{
      type: 'confirm',
      message: '是否开启订餐提醒？',
      name: 'notify',
      default: true,
    }])
    .then(answers => {
      if (answers && answers.notify) {
        const { scheduleOrderNotify, scheduleOrderTwiceNotify } = require('./scheduler');
        scheduleOrderNotify();
        scheduleOrderTwiceNotify();
      }
    })
    .catch(error => {
      console.error('error: ', error);
    });
}



