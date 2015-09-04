/**
 *
 */
import ajax = require('../caleydo_core/ajax');
import session = require('../caleydo_core/session');

export function login(username:string, password:string) {
  return ajax.send('/login', {
    username: username,
    password: password
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
  form.onsubmit = (event) => {
    const username = form['login_username'].value;
    const password = form['login_password'].value;
    login(username, password)
      .then((user) => callback(null, user))
      .catch((error) => callback(error, null));
    event.stopPropagation();
    event.preventDefault();
  };
}
