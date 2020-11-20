import base64
from Crypto.Cipher import AES as AES_Main
from Crypto import Random

class AES:
    BLOCK_SIZE = 16

    def pad(data):
        length = AES.BLOCK_SIZE - (len(data) % AES.BLOCK_SIZE)
        return data + chr(length)*length

    def unpad(data):
        return data[:-ord(data.decode()[-1])]

    def encrypt(message, key):
        IV = Random.new().read(AES.BLOCK_SIZE)
        aes = AES_Main.new(key, AES_Main.MODE_CBC, IV)
        return base64.b64encode(IV + aes.encrypt(AES.pad(message))).decode()

    def decrypt(encrypted, key):
        encrypted = base64.b64decode(encrypted)
        IV = encrypted[:AES.BLOCK_SIZE]
        aes = AES_Main.new(key, AES_Main.MODE_CBC, IV)
        return AES.unpad(aes.decrypt(encrypted[AES.BLOCK_SIZE:])).decode()