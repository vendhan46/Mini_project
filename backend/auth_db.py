import os
import sqlite3
import secrets
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), "xpressify.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )

    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            detected_emotion TEXT,
            final_emotion TEXT,
            action TEXT NOT NULL,
            song_url TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
        """
    )

    conn.commit()
    conn.close()


def create_user(name, email, password):
    conn = get_connection()
    cursor = conn.cursor()

    existing = cursor.execute("SELECT id FROM users WHERE email = ?", (email.lower(),)).fetchone()
    if existing:
        conn.close()
        return None

    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat()

    cursor.execute(
        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
        (name.strip(), email.lower().strip(), password_hash, created_at),
    )
    user_id = cursor.lastrowid
    conn.commit()

    user = cursor.execute(
        "SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)
    ).fetchone()
    conn.close()
    return dict(user)


def authenticate_user(email, password):
    conn = get_connection()
    cursor = conn.cursor()

    user_row = cursor.execute(
        "SELECT id, name, email, password_hash, created_at FROM users WHERE email = ?",
        (email.lower().strip(),),
    ).fetchone()
    conn.close()

    if not user_row:
        return None

    if not check_password_hash(user_row["password_hash"], password):
        return None

    return {
        "id": user_row["id"],
        "name": user_row["name"],
        "email": user_row["email"],
        "created_at": user_row["created_at"],
    }


def create_session(user_id):
    token = secrets.token_urlsafe(32)
    created_at = datetime.utcnow().isoformat()

    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, created_at),
    )
    conn.commit()
    conn.close()

    return token


def delete_session(token):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()


def get_user_by_token(token):
    conn = get_connection()
    cursor = conn.cursor()

    row = cursor.execute(
        """
        SELECT u.id, u.name, u.email, u.created_at
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
        """,
        (token,),
    ).fetchone()

    conn.close()
    return dict(row) if row else None


def add_interaction(user_id, detected_emotion, final_emotion, action, song_url=None):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO interactions (user_id, detected_emotion, final_emotion, action, song_url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            detected_emotion,
            final_emotion,
            action,
            song_url,
            datetime.utcnow().isoformat(),
        ),
    )

    conn.commit()
    conn.close()


def get_user_history(user_id, limit=30):
    conn = get_connection()
    cursor = conn.cursor()

    rows = cursor.execute(
        """
        SELECT id, detected_emotion, final_emotion, action, song_url, created_at
        FROM interactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
        """,
        (user_id, limit),
    ).fetchall()

    conn.close()
    return [dict(row) for row in rows]


def get_dashboard_summary(user_id):
    conn = get_connection()
    cursor = conn.cursor()

    total_interactions = cursor.execute(
        "SELECT COUNT(*) AS count FROM interactions WHERE user_id = ?",
        (user_id,),
    ).fetchone()["count"]

    mood_row = cursor.execute(
        """
        SELECT COALESCE(final_emotion, detected_emotion) AS mood, COUNT(*) AS count
        FROM interactions
        WHERE user_id = ?
        GROUP BY mood
        ORDER BY count DESC
        LIMIT 1
        """,
        (user_id,),
    ).fetchone()

    recent = cursor.execute(
        """
        SELECT id, detected_emotion, final_emotion, action, song_url, created_at
        FROM interactions
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
        """,
        (user_id,),
    ).fetchall()

    conn.close()

    return {
        "total_interactions": total_interactions,
        "top_mood": mood_row["mood"] if mood_row else None,
        "recent_interactions": [dict(row) for row in recent],
    }
