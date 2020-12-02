const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const order  = require('../src/order');
const menu = require('../src/menu');
const utils = require('../src/utils');

const createOrderCommand = async (isUpdate) => {
  const result = await utils.mayIOrder();
  if (!result.status) {
    console.error(chalk.red(result.msg));
    return;
  }
  if (result.status === 'ORDER') {
    console.log(chalk.yellow(result.msg));
  }
  
  const spinner = ora('获取菜单...');
  spinner.start();
  const menuMap = await menu.getMenus();
  if (!menuMap) {
    spinner.failed('未获取到菜单');
    return;
  }
  spinner.succeed();
  const menus = utils.renderMenuChoice(menuMap);
  inquirer
    .prompt({
      type: 'list',
      name: 'food',
      message: '请选择餐品',
      choices: menus,
      pageSize: 20,
    })
    .then(async (answers) => {
      if (answers && answers.food) {
        if (!isUpdate) {
          order.createOrder(answers.food);
          return;
        }
        const res = await order.deleteOrder();
        if (res === true) {
          order.createOrder(answers.food);
        }
      }
    })
    .catch(error => {
      console.error('error: ', error);
    })
}

module.exports = (arg = {}) => {
  if (!utils.checkConfigExist()) {
    console.error('配置文件缺失，请执行alacarte init后再订餐');
    return;
  }
  if (arg.delete) {
    order.deleteOrder();
    return;
  }

  if (arg.update) {
    createOrderCommand(true);
    return;
  }

  if (arg.view) {
    utils.getOrderResFood();
    return;
  }

  createOrderCommand();
}



