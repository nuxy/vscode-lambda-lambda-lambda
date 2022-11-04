/**
 *  vscode-lambda-lambda-lambda
 *  VS Code extension to create a new L³ application.
 *
 *  Copyright 2022, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */

import {window, workspace, Uri, WorkspaceEdit} from 'vscode';
import {camelCase, pascalCase} from 'change-case';
import {renderFile} from 'template-file';

import * as fs   from 'fs';
import * as path from 'path';

export interface AppConfig {
  description: string,
  name: string,
  prefix: string,
  timeout: string
}

interface TemplateVars {
  appDescription?: AppConfig['description'],
  appName?: AppConfig['name'],
  appPrefix?: AppConfig['prefix'],
  appTimeout?: AppConfig['timeout'],
  cfResourceName?: string,
  routePath?: string
}

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
    cfResourceName: pascalCase(appConfig.name),
    routePath: `${appConfig.prefix}/example`
  };

  const manFiles: string[] = (await renderFile(manifest, {...vars})).split(/\r?\n/);
  const tplFiles: string[] = fs.readdirSync(templates);

  for (let tplFile of tplFiles) {
    const outFile: string | void = getFsPath(manFiles, tplFile);

    if (outFile) {
      const outDir = path.dirname(outFile);

      // Select template based on type.
      if (isMiddleware(outFile)) {
        tplFile = `${templates}/middleware.js`;
      } else if (isRoute(outFile)) {
        tplFile = `${templates}/route.js`;
      } else {
        tplFile = `${templates}/${tplFile}`;
      }

      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, {recursive: true});
      }

      const content: string = await renderFile(tplFile, {...vars});
      fs.writeFileSync(outFile, content, 'utf8');

      const wsedit = new WorkspaceEdit();
      wsedit.createFile(Uri.parse(outFile), {ignoreIfExists: true});

      workspace.applyEdit(wsedit);
    }
  }

  window.showInformationMessage('Created application sources.');
}

/**
 * Generate file sources from a template.
 */
export async function createFile(name: string, extPath: string, outPath: string, tplType: string) {
  const templates = `${extPath}/templates`;

  let resPath: string = getResourcePath(outPath);
  resPath = (resPath) ? `${resPath}/` : '';

  const vars: TemplateVars = {
    routePath: `${getAppPrefix()}/${resPath}${name.toLowerCase()}`
  };

  const outFile = `${outPath}/${pascalCase(name)}.js`;

  // Select template based on type.
  const tplFile = (tplType === 'Middleware')
    ? `${templates}/middleware.js`
    : `${templates}/route.js`;

  const content: string = await renderFile(tplFile, {...vars});
  fs.writeFileSync(outFile, content, 'utf8');

  const wsedit = new WorkspaceEdit();
  wsedit.createFile(Uri.parse(outFile), {ignoreIfExists: true});
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
