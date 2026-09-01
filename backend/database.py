"""
database.py — SQLite prediction history
"""
import sqlite3
import json
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "predictions.db"


def get_conn():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp   TEXT NOT NULL,
                prediction  TEXT NOT NULL,
                prob_yes    REAL NOT NULL,
                prob_no     REAL NOT NULL,
                model_name  TEXT NOT NULL,
                input_data  TEXT
            )
        """)
        conn.commit()


def save_prediction(prediction: str, prob_yes: float, prob_no: float,
                    model_name: str, input_data: dict = None):
    ts = datetime.utcnow().isoformat() + "Z"
    with get_conn() as conn:
        conn.execute(
            """INSERT INTO predictions (timestamp, prediction, prob_yes, prob_no, model_name, input_data)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (ts, prediction, prob_yes, prob_no, model_name,
             json.dumps(input_data) if input_data else None)
        )
        conn.commit()


def get_history(limit: int = 200):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM predictions ORDER BY id DESC LIMIT ?", (limit,)
        ).fetchall()
    return [dict(r) for r in rows]


def clear_history():
    with get_conn() as conn:
        conn.execute("DELETE FROM predictions")
        conn.commit()


# Initialize on import
init_db()
