/**
 *
 */
import * as formTemplate from 'html-loader!./_login_form.html';
import {send} from 'phovea_core/src/ajax';
import {offline} from 'phovea_core/src/index';
import * as security from 'phovea_core/src/security';

export const form = String(formTemplate);

export function login(username:string, password:string, remember = false) {
  security.reset();
  return send('/login', {
    username,
    password,
    remember
  }, 'post').then(function (user) {
    security.login(user);
    return user;
  }).catch(function (error) {
    security.logout();
  });
}

export function logout() : Promise<any> {
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

export function bindLoginForm(form: HTMLFormElement, callback: (error: any, user: security.IUser) => any) {
  security.reset();
  if (!offline) {
    send('/loggedinas', {}, 'POST')
      .then((user) => {
        if (user !== 'not_yet_logged_in' && user.name) {
          security.login(user);
          callback(null, user);
        }
      })
      .catch((error) => {
        //ignore not yet logged in
      });
  }
  form.onsubmit = (event) => {

    const username = (<any>form).login_username.value;
    const password = (<any>form).login_password.value;
    const rememberMe = (<any>form).login_remember.checked;
    login(username, password, rememberMe)
      .then((user) => callback(null, user))
      .catch((error) => callback(error, null));
    event.stopPropagation();
    event.preventDefault();
  };
}
