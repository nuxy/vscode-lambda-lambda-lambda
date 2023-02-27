/**
 *  vscode-lambda-lambda-lambda
 *  VS Code extension to create a new L³ application.
 *
 *  Copyright 2022-2023, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */

import {commands, window, ExtensionContext, Uri} from 'vscode';

// Local modules
import {createFile, createFiles, AppConfig} from './generator';

interface InputBoxOpts {
  placeHolder: string,
  title: string,
  validateInput: {(value: string): string | undefined},
  value?: string,
  step?: number
}

interface QuickPickItem {
  label: string
}

interface QuickPickOpts {
  placeHolder: string,
  title: string,
  items: QuickPickItem[],
  step?: number
}

/**
 * Activate the VS Code extension.
 */
export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    createApp(context),
    createResource(context, 'Middleware'),
    createResource(context, 'Route')
  );
}

/**
 * Create new L³ application options.
 */
function createApp(context: ExtensionContext) {
  return commands.registerCommand('lambda-lambda-lambda.createApp', async () => {
    const inputBoxTitle = 'L³: Create new application';

    // Prompt application values.
    const name: string | undefined = await promptInputBox({
      placeHolder: 'Application name (Example: restfulApiHandler)',
      title: inputBoxTitle,
      validateInput: value => {
        return (value && /^[a-zA-Z0-9]{1,40}$/.test(value))
          ? undefined : 'Alphanumeric characters, no spaces';
      },
      step: 1
    });

    const description: string | undefined = await promptInputBox({
      placeHolder: 'Description',
      title: inputBoxTitle,
      validateInput: value => {
        return (value && /^[\w-.,!? ]{1,100}$/.test(value))
          ? undefined : 'Alphanumeric characters, .,!? punctuation';
      },
      step: 2
    });

    const prefix: string | undefined = await promptInputBox({
      placeHolder: 'Request prefix (Example: /api)',
      title: inputBoxTitle,
      validateInput: value => {
        return (value && /^\/[\w-]{0,100}$/.test(value))
          ? undefined : 'Alphanumeric characters, must start with /';
      },
      step: 3
    });

    const timeout: string | undefined = await promptInputBox({
      placeHolder: 'Function timeout (in seconds)',
      title: inputBoxTitle,
      validateInput: value => {
        return (value && /^[\d]{1,2}$/.test(value))
          ? undefined : 'Numbers only';
      },
      step: 4
    });

    const sdkVersion: string | undefined = await promptQuickPick({
      placeHolder: 'AWS SDK for JavaScript version',
      title: inputBoxTitle,
      items: [{label: '2'}, {label: '3'}],
      step: 5
    });

    // Generate sources from templates.
    if (description && name && prefix && timeout && sdkVersion) {
      const appConfig: AppConfig = {description, name, prefix, timeout, sdkVersion};

      createFiles(appConfig, context.extensionPath);
    } else {
      window.showErrorMessage('Failed to create application sources.');
    }
  });
}

/**
 * Create new L³ application resource.
 */
function createResource(context: ExtensionContext, type: string) {
  return commands.registerCommand(`lambda-lambda-lambda.create${type}`, async (uri: Uri) => {
    const inputBoxTitle = 'L³: Create new application resource';

    // Prompt application values.
    const name: string | undefined = await promptInputBox({
      placeHolder: `${type} name (Example: ${type === 'Route' ? 'Login' : 'BasicAuthHandler'})`,
      title: inputBoxTitle,
      validateInput: value => {
        return (value && /^[a-zA-Z0-9]{1,40}$/.test(value))
          ? undefined : 'Alphanumeric characters, no spaces';
      }
    });

    // Generate file from template.
    if (name) {
      createFile(name, context.extensionPath, uri.path);
    } else {
      window.showErrorMessage(`Failed to create ${type} resource`);
    }
  });
}

/**
 * Create a new InputBox instance.
 */
function promptInputBox(opts: InputBoxOpts): Promise<any> {
  return new Promise((resolve, reject) => {
    const inputBox = window.createInputBox();
    inputBox.placeholder = opts.placeHolder;
    inputBox.title       = opts.title;
    inputBox.value       = opts.value || '';
    inputBox.step        = opts.step;
    inputBox.totalSteps  = 5;

    // Handle events.
    inputBox.onDidAccept(() => {
      const value = inputBox.value;
      const error = opts.validateInput(value);

      if (error) {
        inputBox.validationMessage = error;
      } else {
        inputBox.hide();
        resolve(value);
      }
    });

    inputBox.show();
  });
}

/**
 * Create a new QuickPick instance.
 */
function promptQuickPick(opts: QuickPickOpts): Promise<any> {
  return new Promise((resolve, reject) => {
    const quickPick = window.createQuickPick();
    quickPick.placeholder = opts.placeHolder;
    quickPick.title       = opts.title;
    quickPick.items       = opts.items;
    quickPick.step        = opts.step;
    quickPick.totalSteps  = 5;

    // Handle events.
    quickPick.onDidChangeSelection(items => resolve(items[0].label));
    quickPick.onDidAccept(() => quickPick.dispose());
    quickPick.onDidHide(() => quickPick.dispose());

    quickPick.show();
  });
}
