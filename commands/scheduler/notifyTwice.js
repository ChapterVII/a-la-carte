const notify = require('../notify');
const utils = require('../../src/utils');

const noticeTwice = () => {
  const data = utils.readOrderFile();
  if (!data || data.date !== utils.today) {
    notify(true);
    return;
  }
}

noticeTwice();
