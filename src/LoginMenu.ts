/**
 * Created by Samuel Gratzl on 28.02.2017.
 */


import {mixin} from 'phovea_core/src/index';
import {EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM, ICustomizedLoginFormPluginDesc, ICustomizedLoginFormPlugin} from './extensions';
import {bindLoginForm, form as defaultLoginForm, logout} from './login';
import {EventHandler} from 'phovea_core/src/event';
import {list as listPlugin} from 'phovea_core/src/plugin';
import './style.scss';


export interface ILoginMenuOptions {
  /**
   * formular used for the login dialog
   */
  loginForm?: string;

  document?: Document;
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
export default class LoginMenu extends EventHandler {
  static readonly EVENT_LOGGED_IN = 'loggedIn';
  static readonly EVENT_LOGGED_OUT = 'loggedOut';

  readonly node: HTMLUListElement;

  private readonly options: ILoginMenuOptions = {
    loginForm: undefined,
    document
  };

  private readonly customizer: ICustomizedLoginFormPluginDesc[];

  constructor(private readonly adapter: ILoginMenuAdapter, options: ILoginMenuOptions = {}) {
    super();
    mixin(this.options, options);
    this.customizer = listPlugin(EXTENSION_POINT_CUSTOMIZED_LOGIN_FORM);
    this.node = this.init();
  }

  private init() {
    const doc = this.options.document;
    const ul = doc.createElement('ul');
    ul.classList.add('nav', 'navbar-nav', 'navbar-right');
    ul.innerHTML = `
      <li id="login_menu">
        <a data-toggle="modal" data-target="#loginDialog" href="#">
        <i class="fa fa-user fa-fw" aria-hidden="true"></i>
        </a></li>
        <li style="display: none" class="dropdown" id="user_menu">
            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true"
               aria-expanded="false"><i class="fa fa-user" aria-hidden="true"></i> <span>Unknown</span></a>
            <ul class="dropdown-menu">
                <li role="separator" class="divider"></li>
                <li><a href="#" id="logout_link">Logout</a></li>
            </ul>
        </li>`;


    ul.querySelector('#logout_link').addEventListener('click', (evt) => {
      this.adapter.wait();
      evt.preventDefault();
      evt.stopPropagation();
      logout().then(() => {
        this.fire(LoginMenu.EVENT_LOGGED_OUT);
        const userMenu = <HTMLElement>doc.querySelector('#user_menu');
        if (userMenu) {
          userMenu.style.display = 'none';
        }
        (<HTMLElement>ul.querySelector('#login_menu')).style.display = null;
        Array.from(doc.querySelectorAll('.login_required')).forEach((n: HTMLElement) => {
          n.classList.add('disabled');
        });
        this.adapter.ready();
      });
    });

    const dialog = this.initLoginDialog(ul.ownerDocument.body);

    this.runCustomizer(ul, dialog);

    return ul;
  }

  private runCustomizer(menu: HTMLElement, dialog: HTMLElement) {
    Promise.all(this.customizer.map((d) => d.load())).then((loaded: ICustomizedLoginFormPlugin[]) => {
      loaded.forEach((l) => l.factory(menu, dialog));
    });
  }

  forceShowDialog() {
    const doc = this.options.document;
    const loginDialog = <HTMLElement>doc.querySelector('#loginDialog');
    (<HTMLElement>loginDialog.querySelector('.modal-header .close')).classList.add('hidden'); // disable closing the dialog
    this.adapter.showAndFocusOn('#loginDialog', '#login_username');
  }

  private initLoginDialog(body: HTMLElement) {

    let loginForm = this.options.loginForm;
    if (!loginForm) {
      const t = this.customizer.find((d) => d.template != null);
      if (t) {
        loginForm = t.template;
      } else {
        loginForm = defaultLoginForm;
      }
    }
    body.insertAdjacentHTML('beforeend', `
      <!--login dialog-->
      <div class="modal fade" id="loginDialog" tabindex="-1" role="dialog" aria-labelledby="loginDialog" data-keyboard="false" data-backdrop="static">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                aria-hidden="true">&times;</span></button>
              <h4 class="modal-title">Please login</h4>
            </div>
            <div class="modal-body">
              <div class="alert alert-warning" role="alert">The server seems to be offline! Login not possible. Try again later.</div>
              ${loginForm}
            </div>
          </div>
        </div>
      </div>`);

    const dialog = <HTMLDivElement>body.querySelector('#loginDialog');
    const form = <HTMLFormElement>dialog.querySelector('form');
    bindLoginForm(form, (error, user) => {
      const success = !error && user;
      if (!success) {
        this.adapter.ready();
        if (error === 'not_reachable') {
          dialog.classList.add('has-warning');
        } else {
          dialog.classList.remove('has-warning');
          dialog.classList.add('has-error');
        }
        return;
      }

      this.fire(LoginMenu.EVENT_LOGGED_IN);
      const doc = this.options.document;

      dialog.classList.remove('has-error', 'has-warning');

      const userMenu = <HTMLElement>doc.querySelector('#user_menu');
      if (userMenu) {
        userMenu.style.display = null;
        const userName = <HTMLElement>userMenu.querySelector('a:first-of-type span');
        if (userName) {
          userName.textContent = user.name;
        }
      }

      (<HTMLElement>doc.querySelector('#login_menu')).style.display = 'none';
      // remove all .login_required magic flags
      Array.from(doc.querySelectorAll('.login_required.disabled')).forEach((n: HTMLElement) => {
        n.classList.remove('disabled');
        n.setAttribute('disabled', null);
      });

      this.adapter.hideDialog('#loginDialog');
    }, () => {
      // reset error
      dialog.classList.remove('has-error', 'has-warning');
    });

    return dialog;
  }
}
