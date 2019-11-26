import {IRegistry, asResource} from 'phovea_core/src/plugin';

//register all extensions in the registry following the given pattern
export default function (registry: IRegistry) {
  //registry.push('extension-type', 'extension-id', function() { return System.import('./src/extension_impl'); }, {});
  registry.push('epPhoveaCoreLocale', 'phoveaCoreLocaleEN', function () {
    return System.import('./assets/locales/en/phovea.json').then(asResource);
  }, {
      ns: 'phovea',
    });
}
