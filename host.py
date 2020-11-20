import flask, base64, json, os, math, threading, random, waitress, qrcode, mysql.connector
from AES import AES
from flask_limiter import Limiter

import config

os.system("title CodesBin Host")

def getDatabase():
    return mysql.connector.connect(
        host = config.host,
        user = config.username,
        passwd = config.password,
        database = "CodesBin"
    )

app = flask.Flask(__name__)

####################################################################################

####################################################################################

# # CREATING DATABASE:

# with getDatabase() as database:
#     with database.cursor() as cursor:
#         cursor.execute("CREATE DATABASE CodesBin;")
#         database.commit()
