const inquirer = require('inquirer');
const ora = require('ora');
const { renderMenuChoice, checkConfigExist, checkTodayMenuCached } = require('../src/utils');
const { createOrder } = require('../src/order');
const { getMenus } = require('../src/menu');

module.exports = async () => {
  if (!checkConfigExist()) {
    console.error('配置文件缺失，请执行alacarte init后再订餐');
    return;
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
    .then(answers => {
      if (answers && answers.food) {
        const [validFoodName] = answers.food.split('(');
        createOrder(validFoodName);
      }
    })
    .catch(error => {
      console.error('error: ', error);
    })
}



