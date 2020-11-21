import qrcode, base64, json, os, math, threading, string, random, waitress
import flask, mysql.connector, flask_limiter, time, datetime
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

app = flask.Flask(__name__, static_folder = "resources/")
limiter = flask_limiter.Limiter(app, key_func = get_remote_address)

project = {
    "name": "CodesBin",
    "website": "http://localhost/",
    "host": "localhost"
}

@app.route("/", methods = ["GET"])
@limiter.limit("5/second")
def index():
    args = flask.request.args
    data = flask.request.get_data(as_text = True)
    headers = flask.request.headers
    cookies = flask.request.cookies
    method = flask.request.method
    ip = flask.request.remote_addr
    
    return flask.render_template("index.html", config = project)

@app.route("/p/<urlId>", methods = ["GET", "POST"])
@limiter.limit("5/second")
def post():
    args = flask.request.args
    data = flask.request.get_data(as_text = True)
    headers = flask.request.headers
    cookies = flask.request.cookies
    method = flask.request.method
    ip = flask.request.remote_addr

@app.route("/api/create-post", methods = ["POST"])
@limiter.limit("1/second")
def createPost():
    args = flask.request.args
    data = flask.request.get_data(as_text = True)
    headers = flask.request.headers
    cookies = flask.request.cookies
    method = flask.request.method
    ip = flask.request.remote_addr

    try:
        data = json.loads(data)

        text = str(data["data"])
        passwordProtected = bool(data["passwordProtected"])
        verificationToken = data["verificationToken"]
        syntaxHighlighting = str(data["syntaxHighlighting"])
        deleteAfterTime = int(data["deleteAfterTime"])
        deleteAfterViews = int(data["deleteAfterViews"])
        hideTimeOfCreation = bool(data["hideTimeOfCreation"])
        hideNumberOfViews = bool(data["hideNumberOfViews"])
    except Exception as e:
        print(e)
        return flask.jsonify({
            "success": False,
            "error": "invalid-json"
        }), 400

    invalidJson = False

    if not text:
        invalidJson = True

    elif passwordProtected and not verificationToken:
        invalidJson = True

    elif deleteAfterTime < 0 or deleteAfterViews < 0:
        invalidJson = True

    if invalidJson:
        return flask.jsonify({
            "success": False,
            "error": "invalid-json"
        }), 400

    urlId = generateToken(10)
    with getDatabase() as database:
        with database.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM Posts WHERE urlId = %s",
                (urlId,)
            )
            result = cursor.fetchone()

    while result:
        urlId = generateToken(10)
        with getDatabase() as database:
            with database.cursor() as cursor:
                cursor.execute(
                    "SELECT * FROM Posts WHERE urlId = %s",
                    (urlId,)
                )
                result = cursor.fetchone()

    url = project["website"] + "p/" + urlId
    qrCodeUrl = f"/resources/qrCode/{generateToken(100)}.png"

    qr = qrcode.QRCode()
    qr.add_data(url)
    qr.make()
    image = qr.make_image()
    image.save(os.getcwd() + qrCodeUrl)

    with getDatabase() as database:
        with database.cursor() as cursor:
            cursor.execute("""
                INSERT INTO Posts (
                    created,
                    urlId,
                    enabled,
                    expired,
                    views,

                    data,
                    passwordProtected,
                    verificationToken,
                    syntaxHighlighting,
                    deleteAfterViews,
                    deleteAfterTime, -- milliseconds
                    deleteAtTime, -- milliseconds

                    qrCodeUrl,
                    lastView
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
                (
                    int(time.time()*1000),
                    urlId,
                    int(True),
                    int(False),
                    0,

                    text,
                    passwordProtected,
                    verificationToken,
                    syntaxHighlighting,
                    deleteAfterViews if deleteAfterViews else None,
                    int(deleteAfterTime*60*1000),
                    int((time.time()*1000) + (deleteAfterTime*60*1000)) if deleteAfterTime else None,

                    qrCodeUrl,
                    -1
                )
            )

    return flask.jsonify({
        "success": True,
        "url": url,
        "qrCodeUrl": project["website"] + qrCodeUrl.strip("/")
    })

def generateToken(size):
    return "".join([random.choice(string.ascii_letters + string.digits + "_" + "-") for _ in range(size)])

app.run(port = 80, debug = True)

####################################################################################

# # CREATING THE POSTS TABLE:

# with getDatabase() as database:
#     with database.cursor() as cursor:
#         # cursor.execute("DROP TABLE Posts")
#         cursor.execute("""
#             CREATE TABLE Posts (
#                 id BIGINT PRIMARY KEY AUTO_INCREMENT,
#                 created BIGINT,
#                 urlId LONGTEXT,
#                 enabled BOOLEAN,
#                 expired BOOLEAN,
#                 views BIGINT,

#                 data LONGTEXT,
#                 passwordProtected BOOLEAN,
#                 verificationToken LONGTEXT,
#                 syntaxHighlighting LONGTEXT,
#                 deleteAfterViews BIGINT,
#                 deleteAfterTime BIGINT, -- milliseconds
#                 deleteAtTime BIGINT, -- milliseconds

#                 qrCodeUrl LONGTEXT,
#                 lastView BIGINT
#             )
#         """)
#         database.commit()

####################################################################################

# # CREATING THE DATABASE:

# with getDatabase() as mysql:
#     with mysql.cursor() as cursor:
#         cursor.execute("CREATE DATABASE CodesBin;")
#         mysql.commit()
