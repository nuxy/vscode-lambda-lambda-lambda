import {commands, window, ExtensionContext} from 'vscode';

// Local modules
import {createFiles, AppConfig} from './generator';

/**
 * Activate the VS Code extension.
 */
export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('lambda-lambda-lambda.createApp', async () => {

      // Prompt application values.
      const name: string | undefined = await window.showInputBox({
        placeHolder: 'Application name',
        validateInput: value => {
          return (/^[\w-]{1,40}$/.test(value))
            ? null : 'Alphanumeric characters, no spaces';
        }
      });

      const description: string | undefined = await window.showInputBox({
        placeHolder: 'Description',
        validateInput: value => {
          return (/^[\w-.,!? ]{1,100}$/.test(value))
            ? null : 'Alphanumeric characters, .,!? punctuation';
        }
      });

      const prefix: string | undefined = await window.showInputBox({
        placeHolder: 'Prefix',
        validateInput: value => {
          return (/^\/[\w-]{0,100}$/.test(value))
            ? null : 'Alphanumeric characters, must start with /';
        },
        value: '/'
      });

      const timeout: string | undefined = await window.showInputBox({
        placeHolder: 'Timeout',
        validateInput: value => {
          return (/^[\d]{1,2}$/.test(value))
            ? null : 'Numbers only';
        },
        value: '3'
      });

      // Generate sources from templates.
      if (description && name && prefix && timeout) {
        const appConfig: AppConfig = {description, name, prefix, timeout};

        createFiles(appConfig, context.extensionPath);
      } else {
        window.showErrorMessage('Failed to create application sources.');
      }
    })
  );
}
