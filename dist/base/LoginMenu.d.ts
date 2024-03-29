/**
 * Created by Samuel Gratzl on 28.02.2017.
 */
import { EventHandler } from 'phovea_core';
export interface ILoginMenuOptions {
    /**
     * formular used for the login dialog
     */
    loginForm?: string;
    document?: Document;
    watch?: boolean;
}
export interface ILoginMenuAdapter {
    wait(): void;
    ready(): void;
    /**
     * `(<any>$(selector)).modal('hide');`
     * @param {string} selector
     */
    hideDialog(selector: string): void;
    /**
     * ```
     * $(selector).modal('show')
     *  .on('shown.bs.modal', function () {
     *    (<any>$(focusSelector, $loginDialog)).focus();
     *  });
     * ```
     * @param {string} selector
     * @param {string} focusSelector
     */
    showAndFocusOn(selector: string, focusSelector: string): void;
}
/**
 * utility login menu that can be added to the Appheader for instance
 */
export declare class LoginMenu extends EventHandler {
    private readonly adapter;
    static readonly EVENT_LOGGED_IN = "loggedIn";
    static readonly EVENT_LOGGED_OUT = "loggedOut";
    readonly node: HTMLUListElement;
    private readonly options;
    private readonly customizer;
    constructor(adapter: ILoginMenuAdapter, options?: ILoginMenuOptions);
    private init;
    private logout;
    private runCustomizer;
    forceShowDialog(): void;
    private initLoginDialog;
}
