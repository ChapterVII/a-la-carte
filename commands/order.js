const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const { renderMenuChoice, checkConfigExist, checkTodayMenuCached, mayIOrder } = require('../src/utils');
const { createOrder, deleteOrder } = require('../src/order');
const { getMenus } = require('../src/menu');

const createOrderCommand = async () => {
  const result = await mayIOrder();
  if (!result.status) {
    console.error(chalk.red(result.msg));
    return;
  }
  if (result.status === 'ORDER') {
    console.log(chalk.yellow(result.msg));
  }
  let menus;
  if (checkTodayMenuCached()) {
    menus = renderMenuChoice();
  } else {
    const spinner = ora('获取菜单...');
    spinner.start();
    const menuMap = await getMenus();
    menus = renderMenuChoice(menuMap);
    spinner.succeed();
  }
  inquirer
    .prompt({
      type: 'list',
      name: 'food',
      message: 'Please choose your dish',
      choices: menus,
      pageSize: 20,
    })
    .then(async (answers) => {
      if (answers && answers.food) {
        const [validFoodName] = answers.food.split('(');
        await createOrder(validFoodName);
      }
    })
    .catch(error => {
      console.error('error: ', error);
    })
}

const updateOrder = async () => {
  const res = await deleteOrder();
  if (res === true) {
    createOrderCommand();
  }
}

module.exports = (arg) => {
  if (!checkConfigExist()) {
    console.error('配置文件缺失，请执行alacarte init后再订餐');
    return;
  }
  if (arg.delete) {
    deleteOrder();
    return;
  }

  if (arg.update) {
    updateOrder();
    return;
  }

  createOrderCommand();
}



