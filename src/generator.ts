/**
 *  vscode-lambda-lambda-lambda
 *  VS Code extension to create a new L³ application.
 *
 *  Copyright 2022-2023, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */

import {commands, window, workspace}      from 'vscode';
import {camelCase, paramCase, pascalCase} from 'change-case';
import {renderFile}                       from 'template-file';

import * as fs   from 'fs';
import * as path from 'path';

// Local modules
import {AppConfig, TemplateVars} from './types';

/**
 * Generate app sources from templates.
 */
export async function createFiles(appConfig: AppConfig, extPath: string) {
  const templates = `${extPath}/templates`;
  const manifest  = `${templates}/MANIFEST`;

  const vars: TemplateVars = {
    appDescription: appConfig.description,
    appName: camelCase(appConfig.name),
    appPrefix: appConfig.prefix   || '/',
    appTimeout: appConfig.timeout || '3',
    pkgName: paramCase(appConfig.name),
    sdkPackage: (appConfig.sdkVersion === '2') ? 'aws-sdk-mock' : 'aws-sdk-client-mock',
    cfResourceName: pascalCase(appConfig.name),
    routePath: `${appConfig.prefix}/example`
  };

  const manFiles: string[] = (await renderFile(manifest, {...vars})).split(/\r?\n/);
  const tplFiles: string[] = fs.readdirSync(templates);

  for (let tplFile of tplFiles) {
    let outFile: string | void = getFsPath(manFiles, tplFile);

    if (outFile) {
      const outDir: string = path.dirname(outFile);

      const isAsync: boolean = (appConfig.asynchronous === 'Yes');

      // Select template based on type.
      if (isMiddleware(outFile)) {
        tplFile = `${templates}/AccessControlHeaders.js`;
      } else if (isRoute(outFile)) {
        tplFile = `${templates}/route` + (isAsync ? '-async' : '') + '.js';
      } else if (isApp(outFile)) {
        tplFile = `${templates}/app` + (isAsync ? '-async' : '') + '.js';
      } else {
        tplFile = `${templates}/${tplFile}`;
      }

      outFile = outFile.replace(/-async/, '');

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, {recursive: true});
      }

      const content: string = await renderFile(tplFile, {...vars});
      fs.writeFileSync(outFile, content, 'utf8');
    }
  }

  window.showInformationMessage('Created application sources.');
}

/**
 * Generate file sources from a template.
 */
export async function createFile(name: string, extPath: string, outPath: string) {
  const templates = `${extPath}/templates`;

  let resPath: string = getResourcePath(outPath);
  resPath = (resPath) ? `${resPath}/` : '';

  const vars: TemplateVars = {
    routePath: `${getAppPrefix()}/${resPath}${name.toLowerCase()}`
  };

  const outFile = `${outPath}/${pascalCase(name)}.js`;

  // Select template based on type.
  const tplFile = (isMiddleware(outPath))
    ? `${templates}/middleware.js`
    : `${templates}/route.js`;

  const content: string = await renderFile(tplFile, {...vars});
  fs.writeFileSync(outFile, content, 'utf8');

  commands.executeCommand('workbench.files.action.refreshFilesExplorer');
}

/**
 * Return configured application prefix.
 */
function getAppPrefix(): string | void {
  const files = require('find').fileSync('config.json', getWorkspace());

  if (files) {
    return JSON.parse(fs.readFileSync(files[0], 'utf8')).router.prefix;
  }

  window.showErrorMessage('Failed to load application config.');
}

/**
 * Return output path for a given file.
 */
function getFsPath(files: string[], cmpFile: string): string | void {
  const outPath = getWorkspace();

  if (outPath) {
    for (const file of files) {
      const regex = new RegExp(`\/${path.parse(cmpFile).name}`);

      if (regex.test(file) || path.basename(file) === cmpFile) {
        return `${outPath}/${file}`;
      }
    }
  }
}

/**
 * Return path relative to resource directory.
 */
function getResourcePath(value: string): string {
  return value.replace(/^.*\/src\/(?:middleware|routes)\/?(.*)?$/, '$1');
}

/**
 * Return the Workspace root path.
 */
function getWorkspace(): string | undefined {
  return (workspace.workspaceFolders)
    ? workspace.workspaceFolders[0].uri.fsPath : undefined;
}

/**
 * Check for middleware output path.
 */
function isMiddleware(path: string): boolean {
  return !!/\/src\/middleware/.test(path);
}

/**
 * Check for route output path.
 */
function isRoute(path: string): boolean {
  return !!/\/src\/routes/.test(path);
}

/**
 * Check for app output path.
 */
function isApp(path: string): boolean {
  return !!/\/src\/app/.test(path);
}
