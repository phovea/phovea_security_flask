import { PluginRegistry } from 'phovea_core';
import { LocaleExtensionPointDesc } from 'phovea_core';
//register all extensions in the registry following the given pattern
export default function (registry) {
    //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
    registry.push(LocaleExtensionPointDesc.EP_PHOVEA_CORE_LOCALE, 'phoveaSecurityFlaskLocaleEN', function () {
        return System.import('./assets/locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'phovea',
    });
}
//# sourceMappingURL=phovea.js.map