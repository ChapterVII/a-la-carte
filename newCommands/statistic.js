const { Platform } = require('../newSrc/platform');
const { Robot } = require('../newSrc/robot');

export class Statistic extends Platform, Robot {
  constructor() {
    super(this);
  }

  getDishList() {

  }

  chooseMembers() {

  }

  render() {

  }

  sendResult() {
    this.send()
  }
}