import yargs from 'yargs';

export default yargs
  .config('c', 'Load config from a file')
  .alias('c', 'config')
  .default('c', 'config.json')
  .option('t', {
    alias: 'token',
    demand: 'You must provide a Discord Bot Token',
    describe: 'Discord Bot Token',
    nargs: 1,
    requiresArg: true,
    type: 'string'
  })
  .option('H', {
    alias: 'host',
    default: 'localhost',
    describe: 'RED PANDA Host',
    nargs: 1,
    requiresArg: true,
    type: 'string'
  })
  .option('P', {
    alias: 'port',
    default: 21026,
    describe: "RED PANDA RCON Port",
    nargs: 1,
    number: true,
    requiresArg: true,
    type: 'number'
  })
  .option('p', {
    alias: 'password',
    demand: 'You must provide your RED PANDA RCON Password',
    describe: 'RED PANDA RCON Password',
    nargs: 1,
    requiresArg: true,
    type: 'string'
  })
  .option('l', {
    alias: 'log',
    describe: 'Output to LOGFILE',
    nargs: 1,
    requiresArg: true,
    type: 'string'
  })
  .option('ll', {
    alias: 'loglevel',
    choices: ['error', 'warn', 'info', 'verbose', 'debug'],
    default: 'info',
    defaultDescription: 'info',
    describe: 'Log Level',
    nargs: 1,
    requiresArg: true
  })
  .help('h')
  .alias('h', 'help')
  .version()
  .argv;
