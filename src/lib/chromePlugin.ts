/**
 * @description fork from
 * {@link https://github.com/crunchtime-ali/browser-bookmark-manager}
 */
import childProc from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

// import BrowserPlugin from './browserPlugin';


export type NestChildren = Array<NestChildren> & {
    children: NestChildren;
    name: string;
    url: string;
    type: 'url' | 'folder'
};

class ChromePlugin {

  /**
   * Determines the location of the file containing the bookmarks
   * @param  {string} profile name of profiel
   * @return {string}         path to Bookmarks file
   */
  static getBookmarkLocation (profile: string) {
    // Determine Chrome config location
    if (os.type() === 'Darwin') {
      return `${os.homedir()}/Library/Application Support/Google/Chrome/${profile}/Bookmarks`;
    } else if (os.type() === 'Windows_NT') {
      return path.join(os.homedir(), 'AppData', 'Local', 'Google', 'Chrome', 'User Data', profile, 'Bookmarks');
    } else if (os.type() === 'Linux') {
      return path.join(os.homedir(), '.config', 'google-chrome', profile, 'Bookmarks');
    }
  }

  getBookmarkTree(profile: string = 'Default'): NestChildren {
    let data;
    try {
      const location = ChromePlugin.getBookmarkLocation(profile) as string;
      data = fs.readFileSync(location, 'utf8');
    } catch (err) {
        throw new Error(`There is no profile '${profile}'`);
    }
    const obj = JSON.parse(data);
    const roots = obj.roots;
    return Object.keys(roots).map(key => {
      return roots[key];
    }) as NestChildren;
  }

  getBookmarks (profile: string = 'Default') {
    // Yes we can use synchronous code here because the file needs to be loaded before something will happen anyways
    let data;
    try {
      const location = ChromePlugin.getBookmarkLocation(profile) as string;
      data = fs.readFileSync(location, 'utf8');
    } catch (err) {
        throw new Error(`There is no profile '${profile}'`);
    }
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
            value: res.value.url as string
          });
        }
        res = it.next();
      }
    }
    return bookmarkItems;
  }

  open (url: string) {
    if (os.type() === 'Darwin') {
      childProc.exec(`open -a "Google Chrome" "${url}"`);
    } else if (os.type() === 'Windows_NT') {
      childProc.exec(`start chrome "${url}"`);
    } else if (os.type() === 'Linux') {
      childProc.exec(`chrome "${url}"`);
    }
  }
}

function * traverseTree (data: NestChildren): IterableIterator<NestChildren> {
  if (!data) {
    return;
  }

  if (data.children) {
    yield * traverseTree(data.children);
  }

  for (var i = 0; i < data.length; i++) {
    var val = data[i];
    yield val;

    if (val.children) {
      yield * traverseTree(val.children);
    }
  }
}


export default new ChromePlugin();
