import flask, base64, json, os, math, threading, random, waitress, qrcode, mysql.connector, flask_limiter
from AES import AES
from flask_limiter.util import get_remote_address

os.system("title CodesBin Host")

def getDatabase():
    return mysql.connector.connect(
        host = "localhost",
        user = os.environ.get("MySQL_username"),
        passwd = os.environ.get("MySQL_password"),
        database = "CodesBin"
    )

app = flask.Flask(__name__)
limiter = flask_limiter.Limiter(app, key_func = get_remote_address)

project = {
    "name": "CodesBin",
    "website": "https://codesbin.my.to",
    "host": "codesbin.my.to"
}

####################################################################################

# # CREATING THE POSTS TABLE:

# with getDatabase() as database:
#     with database.cursor() as cursor:
#         cursor.execute("""
#             CREATE TABLE Posts (
#                 id BIGINT PRIMARY KEY AUTO_INCREMENT,
#                 created BIGINT,
#                 urlId LONGTEXT,
#                 enabled BOOLEAN,
#                 expired BOOLEAN,
#                 doesExpire BOOLEAN,
#                 expiryClicks BIGINT,
#                 expiryTime BIGINT,
#                 views BIGINT,
#                 passwordProtected BOOLEAN,
#                 data LONGTEXT,
#                 qrCodeUrl LONGTEXT,
#                 lastView BIGINT
#             )
#         """)
#         database.commit()

####################################################################################

# # CREATING DATABASE:

# with getDatabase() as database:
#     with database.cursor() as cursor:
#         cursor.execute("CREATE DATABASE CodesBin;")
#         database.commit()
