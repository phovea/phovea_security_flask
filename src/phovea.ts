import {IRegistry, asResource} from 'phovea_core/src/plugin';
import {ILocaleEPDesc, EP_PHOVEA_CORE_LOCALE} from 'phovea_core/src/extensions';

//register all extensions in the registry following the given pattern
export default function (registry: IRegistry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  registry.push(EP_PHOVEA_CORE_LOCALE, 'phoveaSecurityFlaskLocaleEN', function () {
    return System.import('./assets/locales/en/phovea.json').then(asResource);
  }, <ILocaleEPDesc>{
    ns: 'phovea',
  });
}
