"""Storage layer only. Public serving requires separately configured HTTPS/rate limits.
No credentials, player profiles or IP addresses are stored.
"""
import sqlite3
import uuid

GAMES = ('hdmi', 'aii')

class CountStore:
    def __init__(self, path):
        self.path = path
        with self.connect() as db:
            db.executescript('CREATE TABLE IF NOT EXISTS counts(game TEXT PRIMARY KEY,total INTEGER NOT NULL DEFAULT 0); CREATE TABLE IF NOT EXISTS plays(event TEXT PRIMARY KEY,game TEXT NOT NULL);')
            db.executemany('INSERT OR IGNORE INTO counts(game) VALUES (?)', [(g,) for g in GAMES])

    def connect(self):
        return sqlite3.connect(self.path, timeout=10)

    def counts(self):
        with self.connect() as db:
            return dict(db.execute('SELECT game,total FROM counts'))

    def start(self, game, event):
        if game not in GAMES:
            raise ValueError('unknown game')
        parsed = uuid.UUID(event)
        if parsed.version != 4 or str(parsed) != event:
            raise ValueError('event must be canonical UUID4')
        with self.connect() as db:
            db.execute('BEGIN IMMEDIATE')
            old = db.execute('SELECT game FROM plays WHERE event=?', (event,)).fetchone()
            if old and old[0] != game:
                raise ValueError('event reused for a different game')
            if not old:
                db.execute('INSERT INTO plays(event,game) VALUES (?,?)', (event, game))
                db.execute('UPDATE counts SET total=total+1 WHERE game=?', (game,))
            return {'counts': dict(db.execute('SELECT game,total FROM counts'))}
