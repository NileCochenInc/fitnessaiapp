import os
import time
import psycopg2
import sys



DATABASE_URL = os.environ.get("DATABASE_URL")


while True:
    print(DATABASE_URL)
    sys.stdout.flush() #flush buffer
    time.sleep(10)