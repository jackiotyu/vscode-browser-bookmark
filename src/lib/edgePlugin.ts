import * as vscode from 'vscode';
import fs from 'fs';
import os from 'os';
import path from 'path';

export type NestChildren = Array<NestChildren> & {
    children: NestChildren;
    name: string;
    url: string;
    type: 'url' | 'folder';
};

export interface Bookmark {
    name: string;
    value: string;
    type: 'edge';
}

export class EdgePlugin {
    /**
     * Determines the location of the file containing the bookmarks
     * @param  {string} profile name of profiel
     * @return {string}         path to Bookmarks file
     */
    static getBookmarkLocation(profile: string = 'Default') {
        let config = vscode.workspace.getConfiguration('browser-bookmark');
        // Determine Edge config location
        if (os.type() === 'Darwin') {
            return (
                config.get<string>('path.mac.edge', '') ||
                `${os.homedir()}/Library/Application Support/Microsoft Edge/${profile}/Bookmarks`
            );
        } else if (os.type() === 'Windows_NT') {
            return (
                config.get<string>('path.win.edge', '') ||
                path.join(os.homedir(), 'AppData', 'Local', 'Microsoft', 'Edge', 'User Data', profile, 'Bookmarks')
            );
        } else if (os.type() === 'Linux') {
            return (
                config.get<string>('path.linux.edge', '') ||
                path.join(os.homedir(), '.config', 'microsoft-edge', profile, 'Bookmarks')
            );
        }
    }

    getBookmarkTree(profile: string = 'Default'): Array<NestChildren> {
        try {
            const location = EdgePlugin.getBookmarkLocation(profile) as string;
            let data = fs.readFileSync(location, 'utf8');
            const obj = JSON.parse(data);
            const roots = obj.roots;
            return Object.keys(roots).map((key) => {
                return roots[key];
            }) as NestChildren;
        } catch {
            return [];
        }
    }

    getBookmarks(profile: string = 'Default'): Bookmark[] {
        // Yes we can use synchronous code here because the file needs to be loaded before something will happen anyways
        try {
            const location = EdgePlugin.getBookmarkLocation(profile) as string;
            let data = fs.readFileSync(location, 'utf8');

            const obj = JSON.parse(data);

            let it: IterableIterator<NestChildren>;
            let res;
            let bookmarkItems = [];

            // Traverse all roots keys
            for (let key in obj.roots) {
                it = traverseTree(obj.roots[key]);
                res = it.next();
                while (!res.done) {
                    if (res.value.type === 'url') {
                        bookmarkItems.push({
                            name: res.value.name as string,
                            value: res.value.url as string,
                            type: 'edge' as 'edge',
                        });
                    }
                    res = it.next();
                }
            }
            return bookmarkItems;
        } catch {
            return [];
        }
    }
}

function* traverseTree(data: NestChildren): IterableIterator<NestChildren> {
    if (!data) {
        return;
    }

    if (data.children) {
        yield* traverseTree(data.children);
    }

    for (var i = 0; i < data.length; i++) {
        var val = data[i];
        yield val;

        if (val.children) {
            yield* traverseTree(val.children);
        }
    }
}

export default new EdgePlugin();
