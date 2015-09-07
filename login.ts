/**
 *
 */
import ajax = require('../caleydo_core/ajax');
import session = require('../caleydo_core/session');

export function login(username:string, password:string, remember = false) {
  return ajax.send('/login', {
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

export function logout() {
  return ajax.send('/logout', {}, 'post').then(function (user) {
    session.remove('user');
    session.remove('user_obj');
  });
}

export function bindLoginForm(form: HTMLFormElement, callback: (error, user) => any) {
  ajax.getJSON('/loggedinas')
    .then((user) => callback(null, user))
    .catch((error) => {
      //ignore not yet logged in
    });
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
