/*
* This program and the accompanying materials are made available under the terms of the
* Eclipse Public License v2.0 which accompanies this distribution, and is available at
* https://www.eclipse.org/legal/epl-v20.html
*
* SPDX-License-Identifier: EPL-2.0
*
* Copyright Contributors to the Zowe Project.
*
*/

import { PMFConstants } from "./PMFConstants";
import { Logger } from "../../../../logger";
const npm  = require("npm");

const iConsole = Logger.getImperativeLogger();

/**
 * Common function that installs a npm package using npm APIs.
 * npm.load doesn't install with passed configuration values such as global and prefix
 * that's why need to use npm.config functions to install packages globally and to a specific prefix
 * The link for all configuration values and descriptions:
 * https://docs.npmjs.com/misc/config
 * The link for use case:
 * https://stackoverflow.com/questions/15957529/can-i-install-a-npm-package-from-javascript-running-in-node-js/15957574#15957574
 * The link how to use NPM programmatically from npm-cli.js documentation:
 * https://github.com/npm/cli/blob/latest/bin/npm-cli.js#L75
 * @param {string} prefix Path where to install npm the npm package.
 *
 * @param {string} global Option to install a package globally or not.
 *
 * @param {string} registry The npm registry to install from.
 *
 * @param {string} npmPackage The name of package to install.
 *
 * @return {Promise<string>} Log response from NPM api
 *
 */
export async function installPackages(prefix: string, registry: string, global: boolean, npmPackage: string) {
    const npmOptions: object = { prefix, global, registry };
    return new Promise((resolve) => {
        npm.load(npmOptions, (err: Error) => {
            if (err) {
                iConsole.error(err.message);
                throw new Error(err.message);
            }
            const globalOrNot = npm.config.get("global");
            const globalPrefix = npm.config.get("prefix");
            resolve(new Promise((resolveInstall) => {
                npm.config.set("global-style", true);
                npm.config.set("global", global);
                npm.config.set("prefix", PMFConstants.instance.PLUGIN_INSTALL_LOCATION);
                const npmLog: string[] = [];
                console.log = (d: string) => {
                    npmLog.push(d);
                    process.stdout.write(d + "\n");
                };
                npm.commands.install([npmPackage], (installError: Error) => {
                    if (installError) {
                        iConsole.error(installError.message);
                        throw new Error(installError.message);
                    }
                    resolveInstall(npmLog);
                });
                npm.config.set("global", globalOrNot);
                npm.config.set("prefix", globalPrefix);
            }));
        });
    });
}

/**
 * Get the registry to install to.
 *
 * @return {Promise<string>}
 */
export async function getRegistry() {
    return new Promise((resolveLoad) => {
        npm.load({}, (err: Error) => {
            if (err) {
                iConsole.error(err.message);
                throw new Error(err.message);
            }
            resolveLoad(new Promise((resolveGetRegistry) => {
                resolveGetRegistry(npm.config.get("registry"));
            }));
        });
    });
}
