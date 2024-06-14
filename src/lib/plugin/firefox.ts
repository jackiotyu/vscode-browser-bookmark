import vscode from 'vscode';
import { PathConfig } from '@/constants';
import fs from 'fs';
import path from 'path';
import os from 'os';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import type { IBrowserPlugin, Bookmark, BookmarkData, IBookmarkFolder, IBookmarkUrl, BrowserType } from '@/type';

export class FirefoxPlugin implements IBrowserPlugin {
    type: BrowserType = 'firefox';
    defaultPath: string;
    private SQL: Promise<SqlJsStatic>;

    constructor() {
        this.defaultPath = this.getDefaultPath();
        this.SQL = initSqlJs({ locateFile: () => path.join(__dirname, 'sql-wasm.wasm') });
    }

    get configPath(): string {
        return vscode.workspace.getConfiguration('browser-bookmark').get<string>(PathConfig.Firefox, '');
    }

    private getDefaultPath(): string {
        const homeDir = os.homedir();
        let profilesPath: string;

        if (process.platform === 'win32') {
            profilesPath = path.join(homeDir, 'AppData', 'Roaming', 'Mozilla', 'Firefox', 'Profiles');
        } else if (process.platform === 'darwin') {
            profilesPath = path.join(homeDir, 'Library', 'Application Support', 'Firefox', 'Profiles');
        } else {
            profilesPath = path.join(homeDir, '.mozilla', 'firefox');
        }
        try {
            const profiles = fs.readdirSync(profilesPath);
            const profileFolder = profiles.find((folder) =>
                fs.existsSync(path.join(profilesPath, folder, 'places.sqlite')),
            );
            if (!profileFolder) throw new Error('Could not find Firefox profile folder.');

            return path.join(profilesPath, profileFolder, 'places.sqlite');
        } catch (error) {
            return '';
        }
    }

    async getBookmarks(): Promise<Array<Bookmark>> {
        try {
            const fileBuffer = fs.readFileSync(this.getBookmarkLocation());
            const db = new (await this.SQL).Database(fileBuffer);

            // 查询书签，按 Firefox 中存储的顺序（position）返回
            const res = db.exec(`SELECT moz_bookmarks.id, moz_bookmarks.title, moz_places.url
                                 FROM moz_bookmarks
                                 LEFT JOIN moz_places ON moz_bookmarks.fk = moz_places.id
                                 WHERE moz_bookmarks.type = 1
                                 ORDER BY moz_bookmarks.position`);

            const bookmarks = res[0].values.map((row) => ({
                name: row[1] as string,
                value: row[2] as string,
                type: 'firefox' as BrowserType,
            }));

            db.close();

            return bookmarks;
        } catch {
            return [];
        }
    }

    async getBookmarkTree(): Promise<BookmarkData> {
        try {
            const fileBuffer = fs.readFileSync(this.getBookmarkLocation());
            const db = new (await this.SQL).Database(fileBuffer);

            // 查询书签树，按 Firefox 中存储的顺序（position）返回
            const treeRes = db.exec(`SELECT moz_bookmarks.id, moz_bookmarks.title, moz_places.url, moz_bookmarks.parent
                                     FROM moz_bookmarks
                                     LEFT JOIN moz_places ON moz_bookmarks.fk = moz_places.id
                                     ORDER BY moz_bookmarks.position`);

            const bookmarks = treeRes[0].values;
            const bookmarkMap = new Map<number, (IBookmarkFolder | IBookmarkUrl) & { parent?: number }>();

            bookmarks.forEach((row) => {
                const [id, title, url, parent] = row;
                // 跳过根节点
                if (parent === 0) return;
                if (url) {
                    bookmarkMap.set(id as number, {
                        name: title as string,
                        url: url as string,
                        type: 'url',
                        parent: parent as number,
                    });
                } else {
                    bookmarkMap.set(id as number, {
                        name: title as string,
                        url: '',
                        type: 'folder',
                        children: [],
                        parent: parent as number,
                    });
                }
            });

            const bookmarkTree: BookmarkData = [];

            bookmarks.forEach((row) => {
                const [id, , , parent] = row;
                const bookmark = bookmarkMap.get(id as number);
                if (bookmark && bookmark.type === 'folder') {
                    const parentBookmark = bookmarkMap.get(parent as number);
                    if (parentBookmark && parentBookmark.type === 'folder') {
                        parentBookmark.children.push(bookmark);
                    } else {
                        bookmarkTree.push(bookmark);
                    }
                } else if (bookmark && bookmark.type === 'url') {
                    const parentBookmark = bookmarkMap.get(parent as number);
                    if (parentBookmark && parentBookmark.type === 'folder') {
                        parentBookmark.children.push(bookmark);
                    } else {
                        bookmarkTree.push(bookmark);
                    }
                }
            });

            db.close();

            return bookmarkTree;
        } catch {
            return [];
        }
    }

    getBookmarkLocation(): string {
        return this.configPath || this.defaultPath;
    }
}

export default FirefoxPlugin;
