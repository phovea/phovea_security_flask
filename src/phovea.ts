import {IRegistry, PluginRegistry} from 'phovea_core';
import {ILocaleEPDesc, EP_PHOVEA_CORE_LOCALE} from 'phovea_core';

//register all extensions in the registry following the given pattern
export default function (registry: IRegistry) {
  //registry.push('extension-type', 'extension-id', function() { return import('./dist/extension_impl'); }, {});
  registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaSecurityFlaskLocaleEN', function () {
    return import('./dist/assets/locales/en/phovea.json').then(PluginRegistry.getInstance().asResource);
  }, <ILocaleEPDesc>{
    ns: 'phovea',
  });
}
