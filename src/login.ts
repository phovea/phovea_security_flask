/**
 *
 */
import {send} from 'phovea_core/src/ajax';
import {offline} from 'phovea_core/src/index';
import * as security from 'phovea_core/src/security';
import i18n from 'phovea_core/src/i18n';

export const form = () => {
  return (`<form class="form-signin" action="/login" method="post">
  <div class="form-group">
    <label class="control-label" for="login_username">${i18n.t('phovea:security_flask.username')}</label>
    <input type="text" class="form-control" id="login_username" placeholder="${i18n.t('phovea:security_flask.username')}" required="required" autofocus="autofocus" autocomplete="username">
  </div>
  <div class="form-group">
    <label class="control-label" for="login_password"> ${i18n.t('phovea:security_flask.password')}</label>
    <input type="password" class="form-control" id="login_password" placeholder="${i18n.t('phovea:security_flask.password')}" required="required" autocomplete="current-password">
  </div>
  <div class="checkbox">
    <label>
      <input type="checkbox" id="login_remember"> ${i18n.t('phovea:security_flask.rememberMe')}
    </label>
  </div>
  <button type="submit" class="btn btn-default"> ${i18n.t('phovea:security_flask.submit')}</button>
  </form>
  `)
}


/**
 * try to login the given user
 * @param {string} username username
 * @param {string} password password
 * @param {boolean} remember whether to set a long term cookie
 * @return {Promise<never | any>} the result in case of a reject it was an invalid request
 */
export function login(username: string, password: string, remember = false) {
  security.reset();
  const r = send('/login', {username, password, remember}, 'post').then((user) => {
    security.login(user);
    return user;
  });
  //separate for multiple catch clauses
  r.catch(() => {
    security.logout();
  });
  return r;
}

/**
 * logs the user out
 * @return {Promise<any>} when done also from the server side
 */
export function logout(): Promise<any> {
  if (!offline) {
    return send('/logout', {}, 'post').then(() => {
      security.logout();
    }).catch(() => {
      security.logout();
    });
  }
  security.logout();
  return Promise.resolve(true);
}

export function loggedInAs() {
  return send('/loggedinas', {}, 'POST')
    .then((user) => {
      if (user !== 'not_yet_logged_in' && user.name) {
        return user;
      }
      return Promise.reject('invalid');
    });
}

/**
 * helper to bind to a login form, assuming that fields `login_username`, `login_password` and `login_remember` exists
 * @param {HTMLFormElement} form
 * @param {(error: any, user: IUser) => any} callback
 */
export function bindLoginForm(form: HTMLFormElement, callback: (error: any, user: security.IUser) => any, onSubmit?: () => void) {
  security.reset();
  if (!offline) {
    loggedInAs().then((user) => {
      security.login(user);
      callback(null, user);
    }).catch(() => {
      //ignore not yet logged in
    });
  }
  form.onsubmit = (event) => {
    if (onSubmit) {
      onSubmit();
    }
    const username = (<any>form).login_username.value;
    const password = (<any>form).login_password.value;
    const rememberMe = (<any>form).login_remember.checked;
    login(username, password, rememberMe)
      .then((user) => callback(null, user))
      .catch((error) => {
        if (error.response && error.response.status !== 401) { // 401 = Unauthorized
          //server error
          callback('not_reachable', null);
        } else {
          callback(error, null);
        }
      });
    event.stopPropagation();
    event.preventDefault();
  };
}
