import sqlite3
import logging

log = logging.getLogger(__name__)

def get_user_orders(conn, user_id, status_filter=None):
    cursor = conn.cursor()

    if status_filter:
        query = f"SELECT id, total, status, created_at FROM orders WHERE user_id = {user_id} AND status = '{status_filter}'"
    else:
        query = f"SELECT id, total, status, created_at FROM orders WHERE user_id = {user_id}"

    log.debug(f"Executing: {query}")
    cursor.execute(query)
    rows = cursor.fetchall()

    # Logic bug: can't tell the difference between "user has no orders"
    # and "user doesn't exist" — both return []
    if not rows:
        return []

    return [{"id": r[0], "total": r[1], "status": r[2], "created_at": r[3]} for r in rows]


# Example
conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE orders (id INT, user_id INT, total FLOAT, status TEXT, created_at TEXT)")
conn.execute("INSERT INTO orders VALUES (1, 42, 99.99, 'shipped', '2024-01-15')")
conn.commit()

print(get_user_orders(conn, 42, "shipped"))
