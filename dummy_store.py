__author__ = 'Samuel Gratzl'

import caleydo_security_flask.flask_login

class User(caleydo_security_flask.flask_login.User):
  def __init__(self, id, password, roles):
    super(User, self).__init__(id)
    self.name = id
    self._password = password
    self.roles = roles

  def is_authenticated(self):
    return True

  def is_active(self):
    return True

class UserStore(object):
  def __init__(self):
    self._users = [
      User('admin', 'admin', ['admin']),
      User('sam', 'secret', ['admin']),
    ]

  def load(self, id):
    return next((u for u in self._users if u.id == id), None)

  def load_from_key(self, api_key):
    return next((u for u in self._users if u.id == api_key), None)

  def login(self, username, extra_fields = {}):
    return next((u for u in self._users if u.id == username and u._password == extra_fields['password']), None)

  def logout(self, user):
    pass


def create():
  return UserStore()