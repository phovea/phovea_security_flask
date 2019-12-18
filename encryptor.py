__author__ = 'Samuel Gratzl'

if __name__ == '__main__':
  import uuid
  import hashlib

  password = input('enter password: ')
  salt = uuid.uuid4().hex
  hashed_password = hashlib.sha512(password + salt).hexdigest()
  print(password)
  print(salt)
  print(hashed_password)
