#!/usr/bin/env node
const program = require('commander');
const initial = require('../commands/initial');
const admin = require('../commands/admin');
const order = require('../commands/order');
const statistic = require('../commands/statistic');

program
  .version('0.0.1')
  .command('init')
  .description('generate your configurable file')
  .action(initial);

  
program
  .command('admin')
  .description('generate administrator configurable file')
  .action(admin);

program
  .command('order')
  .description('choose dishes from menus')
  .action(order);

program
  .command('statistic')
  .description('Count the number of orders for administrator')
  // .option("-u, --username <username>", "your name")
  // .option("-p, --passwo")
  .action(statistic);
  

program.parse(process.argv);
