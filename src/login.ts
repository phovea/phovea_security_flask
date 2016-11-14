/**
 *
 */
import * as formTemplate from 'html-loader!./_login_form.html';
import {send, getJSON} from 'phovea_core/src/ajax';
import {offline} from 'phovea_core/src/index';
import * as session from 'phovea_core/src/session';

export const form = String(formTemplate);

export function login(username:string, password:string, remember = false) {
  return send('/login', {
    username: username,
    password: password,
    remember: remember
  }, 'post').then(function (user) {
    session.store('user', user.name);
    session.store('user_obj', user);

    return user;
  }).catch(function (error) {
    session.remove('user');
    session.remove('user_obj');
  });
}

export function logout() : Promise<any> {
  if (!offline) {
    return send('/logout', {}, 'post').then(function (user) {
      session.remove('user');
      session.remove('user_obj');
    });
  }
  session.remove('user');
  session.remove('user_obj');
  return Promise.resolve(true);
}

export function bindLoginForm(form: HTMLFormElement, callback: (error, user) => any) {
  if (!offline) {
    getJSON('/loggedinas')
      .then((user) => {
        if (user !== 'not_yet_logged_in' && user.name) {
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
