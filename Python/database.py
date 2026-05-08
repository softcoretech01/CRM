import mysql.connector
from mysql.connector import pooling

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Hunter@2334",
    "database": "crm_db",
}

connection_pool = pooling.MySQLConnectionPool(
    pool_name="crm_pool",
    pool_size=5,
    pool_reset_session=True,
    **DB_CONFIG
)


def get_connection():
    return connection_pool.get_connection()


def call_procedure(proc_name: str, args: tuple = ()):
    """Call a stored procedure and return all result rows as list of dicts."""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.callproc(proc_name, args)
        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())
        conn.commit()
        return results
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()


def call_procedure_single(proc_name: str, args: tuple = ()):
    """Call a stored procedure and return a single row dict or None."""
    rows = call_procedure(proc_name, args)
    return rows[0] if rows else None
