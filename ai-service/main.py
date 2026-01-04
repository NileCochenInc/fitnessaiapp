import os
import time
import psycopg2
import sys



DATABASE_URL = os.environ.get("DATABASE_URL")



def database_trial():
    time.sleep(10)
    try:
        # Connect to Postgres
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        # Basic query: list all tables
        cur.execute("""
            SELECT table_name
            FROM information_schema.tables 
            WHERE table_schema='public';
        """) #information schema is built in to postgres
        tables = cur.fetchall()
        print("Tables in database:", tables)

        # Example: query the 'users' table
        cur.execute("SELECT * FROM users LIMIT 5;")
        users = cur.fetchall()
        print("Users:", users)

        # Clean up
        cur.close()
        conn.close()
    except Exception as e:
        print("Error connecting to database:", e)



def main():
    database_trial()

if __name__ == "__main__":
    main()


while True:
    print(DATABASE_URL)
    sys.stdout.flush() #flush buffer
    time.sleep(10)