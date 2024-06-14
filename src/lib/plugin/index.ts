import { IBrowserPlugin, BrowserType, IPluginService } from '@/type';
import { ChromePlugin } from '@/lib/plugin/chrome';
import { EdgePlugin } from '@/lib/plugin/edge';
import { FirefoxPlugin } from '@/lib/plugin/firefox';

// 插件容器
class PluginService implements IPluginService {
    plugins: Map<BrowserType, IBrowserPlugin> = new Map();
    use(plugin: IBrowserPlugin) {
        this.plugins.set(plugin.type, plugin);
    }
    attach(type: BrowserType) {
        return this.plugins.get(type);
    }
    getBookmarkLocation(type: BrowserType) {
        return this.attach(type)?.getBookmarkLocation() || '';
    }
    getBookmarks(type: BrowserType) {
        return Promise.resolve(this.attach(type)?.getBookmarks() || []);
    }
    getBookmarkTree(type: BrowserType) {
        return Promise.resolve(this.attach(type)?.getBookmarkTree() || []);
    }
    dispose() {
        this.plugins.clear();
    }
}

const pluginService = new PluginService();

pluginService.use(new ChromePlugin());
pluginService.use(new EdgePlugin());
pluginService.use(new FirefoxPlugin());

export { pluginService };
