import {commands, window, ExtensionContext} from 'vscode';

// Local modules
import {createFiles, AppConfig} from './generator';

/**
 * Activate the VS Code extension.
 */
export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('lambda-lambda-lambda.createApp', async () => {

      // Prompt the application name.
      const appName: string | undefined = await window.showInputBox({
        placeHolder: 'App name',
        validateInput: value => {
          return (/^[\w-]+$/i.test(value))
            ? null : 'Alphanumeric characters, no spaces.';
        }
      });

      // Generate sources from templates.
      if (appName) {
        const appConfig: AppConfig = {
          description: 'Example description',
          name: appName,
          prefix: '/',
          timeout: 3
        };

        createFiles(appConfig, context.extensionPath);
      }
    })
  );
}
