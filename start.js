const util = require('util');
const { spawn } = require('child_process');
const readline = require('readline');
const exec = util.promisify(require('child_process').exec);

const NETWORK = 'mainnet';
const LEASEHOLD_SNAPSHOT = 'leasehold_main_backup_27022021.gz';
const LISK_SNAPSHOT = 'lisk_main_backup-14576795.gz';
const CONTAINER_NAME = 'leasehold-core';
const IMAGE_NAME = 'leasehold';

const commandLog = (msg, warning = false) =>
  console.log(`\n${warning ? '\x1b[31m' : ''}\x1b[1m${msg}\x1b[0m`);

const errorLog = (msg) => console.error(`\x1b[31m\x1b[1m${msg}\x1b[0m`);

const execCommand = (command) => {
  console.log(`Executing command: ${command}`);
  return new Promise((res, rej) => {
    command = command.split(' ');
    const process = spawn(command[0], command.slice(1));
    readline
      .createInterface({
        input: process.stdout,
        terminal: false,
      })
      .on('line', function (line) {
        console.log(line);
      });
    process.on('close', (code) => res(code));
    process.on('error', (err) => rej(err));
  });

  // const { stdout, stderr } = await exec(command, { shell: true });
  // if (stderr) {
  //   errorLog(stderr);
  // }

  // console.log(stdout);
};

(async () => {
  try {
    const { stdout: ls } = await exec(`ls`);
    if (!ls.includes(LISK_SNAPSHOT)) {
      commandLog(
        'IMPORTANT: Getting Lisk snapshot. This process will take a while!',
        true,
      );
      await execCommand(
        `wget --no-check-certificate https://snapshots.lisk.io/${NETWORK}/${LISK_SNAPSHOT}`,
      );
    } else {
      commandLog(`Skipping ${LISK_SNAPSHOT} it already exists.`);
    }

    if (!ls.includes(LEASEHOLD_SNAPSHOT)) {
      commandLog(
        'IMPORTANT: Getting Leasehold snapshot. This process will take a while!',
        true,
      );
      await execCommand(
        `wget --no-check-certificate https://testnet.leasehold.io/snapshots/${NETWORK}/${LEASEHOLD_SNAPSHOT}`,
      );
    } else {
      commandLog(`Skipping ${LEASEHOLD_SNAPSHOT} it already exists.`);
    }

    commandLog('Building docker container');
    commandLog(
      'IMPORTANT: This process will take a while!',
      true,
    );
    await execCommand(`docker build -t ${IMAGE_NAME} .`);

    commandLog('Removing container if exists.');
    await execCommand(`docker rm --force ${CONTAINER_NAME}`);

    commandLog(`Running container with name ${CONTAINER_NAME}`);
    await execCommand(
      `docker run -d -p 8010:8010 -p 8001:8001 --name ${CONTAINER_NAME} ${IMAGE_NAME}`,
    );

    commandLog('Getting IP of container');
    const { stdout } = await exec(`docker inspect ${CONTAINER_NAME}`);
    const ip = JSON.parse(stdout)[0].NetworkSettings.IPAddress;
    if (ip === '')
      throw new Error('No IP Address available, container probably exited.');

    commandLog(`IP Found: ${ip}`)

    // commandLog(
    //   'IMPORTANT: Writing the snapshot to the DB. This process might take a while!',
    //   true,
    // );
    // await execCommand(
    //   `gzip --decompress --to-stdout ./${LISK_SNAPSHOT} | psql -U leasehold -h ${ip} lisk_main -w`,
    // );

    // commandLog(
    //   'IMPORTANT: Writing the snapshot to the DB. This process might take a while!',
    //   true,
    // );
    // await execCommand(
    //   `gzip --decompress --to-stdout ./${LEASEHOLD_SNAPSHOT} | psql -U leasehold -h ${ip} leasehold_main -w`,
    // );
  } catch (err) {
    errorLog(err.message);
  }
})();
