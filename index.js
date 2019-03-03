#!/usr/bin/env node
const APP_NAME = "nano-preact-app";
const log = console.log;

const path = require("path");
const exec = require("child_process").exec;
const fs = require("fs");
const util = require("util");
const chalk = require("chalk");
const download = require("download-git-repo");

const githubDownload = util.promisify(download);
const deleteFile = util.promisify(fs.unlink);

const args = process.argv.slice(2);
let projectLocation = args[0] && args[0].trim();

log(`
${chalk.green(" ----------- NANO PREACT APP ----------- ")}
`);

const main = async () => {
  // check that there is a project location provided
  if (!projectLocation) {
    log(`  Please specify a project directory:
    ${chalk.cyan(APP_NAME)} ${chalk.green("<project-directory>")}

  For example:
    ${chalk.cyan(APP_NAME)} ${chalk.green("slytherin")}
    `);
    return;
  }

  // ascertain project path and name
  const projectPath = path.join(process.cwd(), projectLocation);
  const projectName =
    projectLocation === "."
      ? path.basename(projectPath)
      : path.basename(projectLocation);

  log(`  ${chalk.cyan("Project path: ") + projectPath}
  ${chalk.cyan("Project name: ") + projectName}
  `);

  // create folder if it does not exist
  const folderExists = fs.existsSync(projectPath);
  if (!folderExists) {
    process.stdout.write("  Creating directory...");
    fs.mkdirSync(projectPath, { recursive: true });
    process.stdout.write(chalk.green(" DONE\n"));
  }

  // download template project from github
  process.stdout.write("  Downloading template project...");
  await githubDownload("abhisheksoni27/nano-preact-app-template", projectPath);
  process.stdout.write(chalk.green(" DONE\n\n"));

  await createNewPackageJSON(projectPath, projectName);

  log(chalk.green("\n\n  Installing dependencies!  \n\n"));
  await exec(`cd ${projectName}; npm install;`);

  await // delete unnecessary files
  await deleteFile(path.join(projectPath, "LICENSE"));
  await deleteFile(path.join(projectPath, "package-lock.json"));

  // notify user that the app is ready
  log(`${chalk.bgMagenta(chalk.cyanBright("  SUCCESS!  "))}

  Created project ${chalk.magenta(projectName)} at ${chalk.magenta(projectPath)}
`);
};

const createNewPackageJSON = async (projectPath, projectName) => {
  const pkgJsonPath = path.join(projectPath, "package.json");
  const packageJSON = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

  const newPackageJSON = {
    ...packageJSON,
    name: projectName,
    description: ""
  };

  await fs.writeFile(
    pkgJsonPath,
    JSON.stringify(newPackageJSON, null, 2),
    "utf8"
  );
};

main();
