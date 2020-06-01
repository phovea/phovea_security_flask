import { PluginRegistry } from 'phovea_core';
import { EP_PHOVEA_CORE_LOCALE } from 'phovea_core';
//register all extensions in the registry following the given pattern
export default function (registry) {
    //registry.push('extension-type', 'extension-id', function() { return import('./src/extension_impl'); }, {});
    registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaSecurityFlaskLocaleEN', function () {
        return import('./assets/locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
    }, {
        ns: 'phovea',
    });
}
//# sourceMappingURL=phovea.js.map