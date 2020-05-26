import {IPlugin, IPluginDesc} from 'phovea_core';

export const EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM = 'securityCustomizedLoginForm';

export interface ICustomizedLoginFormPluginDesc extends IPluginDesc {
  template?: string;
}


export interface ICustomizedLoginFormPlugin extends IPlugin {
  /**
   * underlying plugin description
   */
  readonly desc: ICustomizedLoginFormPluginDesc;

  factory(loginMenu: HTMLElement, loginDialog: HTMLElement): void;
}
