const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const UTILS = require('../newSrc/utils');
const { Meican } = require('../newSrc/meican');
const { Platform } = require('../newSrc/platform');

export class Order {
  constructor(mode = 'add') {
    this.mode = mode;
    this.menu = {};
    this.dish = undefined;
    this.platform = new Platform();
    this.meican = new Meican();
    this.init();
  }

  init() {
    if (this.mode === 'add') {
      this.create();
      return;
    }
    if (this.mode === 'view') {
      this.view();
    }
  }

  async validateBeforeOrder() {
    const result = await UTILS.mayIOrder();
    if (!result.status) {
      console.error(chalk.red(result.msg));
      return;
    }
    if (result.status === 'ORDER') {
      console.log(chalk.yellow(result.msg));
    }
    return true;
  }

  async getMenu() {
    const spinner = ora('获取菜单...');
    spinner.start();
    const meican = new Meican();
    const menuMap = await meican.getTodayMenu();
    if (!menuMap) {
      spinner.failed('未获取到菜单');
      return this;
    }
    spinner.succeed();
    const {date, ...menu} = menuMap;
    this.menu = menu;
    return this;
  }

  getDishByName(name) {
    Object.keys(this.menu).forEach(key => {
      const dishes = this.menu[key];
      if (dishes && dishes.length) {
        const dish = dishes.find(dish => dish.name.include(name));
        if (dish) return dish;
      }
    });
  }

  async renderAndChoose() {
    try {
      if (!this.menu) return this;
      const choices = [];
      Object.keys(this.menu).forEach(key => {
        const dishes = this.menu[key];
        if (dishes && dishes.length) {
          choices.push(new inquirer.Separator(chalk.bgWhite.black(`【${(key)}】 \n`)));
          dishes.forEach((d) => {
            choices.push(`${d.name} \n`);
          });
        }
      });
      if (!choices.length) return this;
      const answers = await inquirer.prompt({
        type: 'list',
        name: 'food',
        message: '请选择餐品',
        choices,
        pageSize: 20,
      });
      if (!answers) return this;
      this.dish = this.getDishByName(answers.food);
      return this;
    } catch (e) {
      console.error('Order.render error: \n', e);
    }
  }

  async create() {
    if (!await this.validateBeforeOrder()) return;
    await (await this.getMenu()).renderAndChoose();
    
    const res1 = await this.platform.createOrder(this.dish.name);
    if (!res1) return;

    const dishesMap = {
      add: this.dish,
    }
    const res2 = await this.meican.createOrder(dishesMap);
    if (!res2) {
      await this.platform.deleteOrder();
    }
  }

  async getTodayDish() {
    const orderList = await this.platform.getTeamOrderList();
    if (!orderList) return;
    const config = UTILS.readConfigFile();
    if (!config || !config.platform) {
      console.error('未获取到配置文件！');
      return;
    }
    const userName = config.platform.name;
    const order = orderList.find(i => i.name === userName);
    if (!order) return;
    await this.getMenu();
    if (!this.menu) return;
    return this.getDishByName(order.food);
  }

  async view() {
    const dish = await this.getTodayDish();
    if (!dish) return;
    console.log(`今日订餐:\n${chalk.bgWhite.black(`【${(resName)}】\n`)}${dish.name}\n`);
  }

  async delete() {
    const dish = await this.getTodayDish();
    if (!dish) return;
    
  }
}