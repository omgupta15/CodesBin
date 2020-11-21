# CodesBin
CodesBin is service using which users can share texts or code snippets quickly and securely. CodesBin uses AES encryption to protect user's data.

If a user enters a password, their text is encrypted using that password and no one can decrypt that text without the password.
The passwords aren't sent to the server and the whole process of encryption & decryption happens on the client-side.

# Features

* Encryption & Decryption on the client-side.
* Syntax highlighting for 150+ languages.
* AES 256-Bit encryption used for encrypting the data.
* Auto-delete post after certain views.
* Auto-expire post after certain time.
* Hide number of views or creation date of the post by just a single click.
* No limit on number of posts.
* Option to view RAW Data.
* Generate, view & download QR Codes for easy sharing.

# Libraries Used

**Frontend:**
* [Ace.js](https://ace.c9.io/ "Ace.js Editor")
* [AES (CryptoJS)](https://cdnjs.com/libraries/aes-js "AES.js")
* [Bootstrap](https://getbootstrap.com/ "Bootstrap")
* [SweetAlert2](https://sweetalert2.github.io/ "SweetAlert2")
* [jQuery](https://jquery.com/ "jQuery")
* [Font Awesome](https://fontawesome.com/ "Font Awesome")

**Backend:**
* [Flask](https://palletsprojects.com/p/flask/ "Flask")
* [MySQL Connector](https://pypi.org/project/mysql-connector/ "MySQL Connector")
* [Waitress WSGI](https://pypi.org/project/waitress/ "Waitress WSGI")
