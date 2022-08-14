import {window, workspace, Uri, WorkspaceEdit} from 'vscode';
import {camelCase, pascalCase} from 'change-case';
import {renderFile} from 'template-file';

import * as fs   from 'fs';
import * as path from 'path';

interface TemplateVars {
  appBaseDir: string,
  appDescription?: string,
  appName: string,
  appTimeout: number,
  appPrefix: string,
  cfResourceName?: string,
  routePath: string
};

/**
 * Generate app sources from templates.
 */
export async function createFiles(appName: string, extPath: string) {
  const templates = `${extPath}/templates`;
  const manifest  = `${templates}/MANIFEST`;

  const vars: TemplateVars = {
    appBaseDir: camelCase(appName),
    appDescription: 'Example description',
    appName: camelCase(appName),
    appTimeout: 3,
    appPrefix: '/',
    cfResourceName: pascalCase(appName),
    routePath: 'example'
  };

  const manFiles: string[] = (await renderFile(manifest, {...vars})).split(/\r?\n/);
  const tplFiles: string[] = fs.readdirSync(templates);

  for (let tplFile of tplFiles) {
    const outFile: string | undefined = getFilePath(manFiles, tplFile);

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
 * Return output path for a given file.
 */
function getFilePath(files: string[], cmpFile: string): string | undefined {
  const outPath: string | undefined = (workspace.workspaceFolders)
    ? workspace.workspaceFolders[0].uri.fsPath: undefined;

  if (outPath) {
    for (const file of files) {
      const regex = new RegExp(`\/${path.parse(cmpFile).name}`);

      if (path.basename(file) === cmpFile || regex.test(file)) {
        return `${outPath}/${file}`;
      }
    }
  }
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
