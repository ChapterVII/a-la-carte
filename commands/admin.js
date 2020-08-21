const inquirer = require('inquirer');
const { saveAdminFile } = require('../src/utils');

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

module.exports = async () => {
  inquirer
    .prompt(promptList)
    .then(answers => {
      // console.log('answers: ', answers);
      const { id, robot, members} = answers;
      const obj = {
        id,
        robot,
        members: members.split(' '),
      };
      saveAdminFile(obj);
    })
    .catch(error => {
      console.error('error: ', error);
    })
}



