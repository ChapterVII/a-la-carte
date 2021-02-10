const inquirer = require('inquirer');
const {Server} = require('../newSrc/server');
const {Platform} = require('../newSrc/platform');
const UTILS = require('../newSrc/utils');

export class Init {
  constructor(admin = false) {
    this.name = '';
    this.server = '';
    this.userConfig = {};
    this.admin = admin;
    this.init();
  }
  async init() {
    await this.promptInputInfo().promptSelectInfo();
    this.save();
  }

  async promptInputInfo() {
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
    if (this.admin) {
      promptList.concat([
        {
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
        }
      ])
    }
    try {
      const answers = await inquirer.prompt(promptList);
      if (!answers) {
        return this;
      }
      const {name, server, ...rest} = answers;
      this.name = name;
      this.server = server;
      if (this.admin) {
        this.userConfig = {
          ...this.userConfig,
          admin: {
            ...this.userConfig.admin,
            ...rest,
          }
        }
      }
      return this;
    } catch (e) {
      console.error('Init.promptInputInfo error: \n', e);
    }
  }

  async getConfig() {
    if (!this.server) return;
    const server = new Server();
    const userConfig = await server.getUserConfig(this.server);
    if (!userConfig) return;
    this.userConfig = userConfig;
    const platform = new Platform();
    const config = await platform.getConfig({
      order: userConfig
    });
    return config;
  }

  async promptSelectInfo() {
    const config = await this.getConfig();
    if (!config) return;
    const promptList = UTILS.requiredConfigItems.map(i => {
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
    try {
      const answers = await inquirer.prompt(promptList);
      if (!answers) {
        return;
      }
      this.userConfig = {
        ...this.userConfig,
        platform: {
          ...this.userConfig.platform,
          ...answers,
          version: config.version,
        }
      }
      return;
    } catch (e) {
      console.error('Init.promptSelectInfo error: \n', e);
    }
  }

  save() {
    const data = {
      ...this.userConfig,
      platform: {
        ...this.userConfig.platform,
        name: this.name,
      },
      server: this.server,
    }
    UTILS.saveConfigFile(data);
  }
}

module.exports = async function init(admin) {
  new Init(admin);
}