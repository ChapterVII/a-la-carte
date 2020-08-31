const inquirer = require('inquirer');
const ora = require('ora');
const commonApi = require('../src/api/common');
const order = require('../src/order');
const utils = require('../src/utils');
const notify = require('./notify');

const promptInputInfo = () => new Promise(resolve => {
  const promptList = [{
    type: 'input',
    message: 'Please enter your name (Chinese): ',
    name: 'name',
    validate: (val) => {
      if (!/^[\u4e00-\u9fa5]{2,}$/.test(val)) {
        return "请输入中文姓名";
      }
      return true;
    }
  },{
    type: 'input',
    message: 'Please enter server:',
    name: 'server',
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
  const promptList = utils.requiredConfigItems.map(i => {
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
  const inputInfo = await promptInputInfo();
  if (!inputInfo) {
    return;
  }

  const { name, server } = inputInfo;

  const spinner = ora('拉取配置项...');
  spinner.start();

  const userConfig = await commonApi.getUserConfig(server);
  if (!userConfig) {
    spinner.fail('配置项userConfig拉取失败！');
    return;
  }
  
  const orderConfig = await order.getConfig(userConfig);
  if (!orderConfig) {
    spinner.fail('配置项orderConfig拉取失败！');
    return;
  }

  spinner.succeed('配置项拉取完成');

  const selectInfo = await promptSelectInfo(orderConfig);
  if (!selectInfo) {
    return;
  }
  const { cookie, ...rest } = userConfig;
  const obj = {
    menu: {
      cookie,
    },
    server,
    order: {
      name,
      ...rest,
      ...selectInfo,
      version: orderConfig.version,
    }
  };
  utils.saveConfigFile(obj);

  inquirer
    .prompt([{
      type: 'confirm',
      message: '是否开启订餐提醒？',
      name: 'notify',
      default: true,
    }])
    .then(async (answers) => {
      if (answers && answers.notify) {
        const { scheduleOrderNotify, scheduleOrderTwiceNotify } = require('./scheduler');
        await scheduleOrderNotify();
        await scheduleOrderTwiceNotify();
        // 避免第一次调用notify 不弹出的问题
        console.log('开启/测试订餐提醒');
        notify();
      }
    })
    .catch(error => {
      console.error('error: ', error);
    });
}



