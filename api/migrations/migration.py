steps = [
[
    """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT DEFAULT 'default_avatar.jpg',
        bio TEXT,
        friends_count INTEGER DEFAULT 0,
        following_count INTEGER DEFAULT 0
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS friendships (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id),
        friend_id INTEGER NOT NULL REFERENCES users (id),
        status TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        music_file TEXT NOT NULL,
        cover TEXT DEFAULT 'default_cover_art.jpg',
        duration INTEGER NOT NULL,
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS genres (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL    
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS song_genres (
        song_id INTEGER NOT NULL REFERENCES songs(id),
        genre_id INTEGER NOT NULL REFERENCES genres(id),
        PRIMARY KEY (song_id, genre_id)
    );
    """,
    """
    INSERT INTO genres (name)
    VALUES 
        ('acoustic'), ('afrobeat'), ('alt-rock'), ('alternative'), ('ambient'),
        ('anime'), ('black-metal'), ('bluegrass'), ('blues'), ('bossanova'),
        ('brazil'), ('breakbeat'), ('british'), ('cantopop'), ('chicago-house'),
        ('children'), ('chill'), ('classical'), ('club'), ('comedy'),
        ('country'), ('dance'), ('dancehall'), ('death-metal'), ('deep-house'),
        ('detroit-techno'), ('disco'), ('disney'), ('drum-and-bass'), ('dub'),
        ('dubstep'), ('edm'), ('electro'), ('electronic'), ('emo'),
        ('folk'), ('forro'), ('french'), ('funk'), ('garage'),
        ('german'), ('gospel'), ('goth'), ('grindcore'), ('groove'),
        ('grunge'), ('guitar'), ('happy'), ('hard-rock'), ('hardcore'),
        ('hardstyle'), ('heavy-metal'), ('hip-hop'), ('holidays'), ('honky-tonk'),
        ('house'), ('idm'), ('indian'), ('indie'), ('indie-pop'),
        ('industrial'), ('iranian'), ('j-dance'), ('j-idol'), ('j-pop'),
        ('j-rock'), ('jazz'), ('k-pop'), ('kids'), ('latin'),
        ('latino'), ('malay'), ('mandopop'), ('metal'), ('metal-misc'),
        ('metalcore'), ('minimal-techno'), ('movies'), ('mpb'), ('new-age'),
        ('new-release'), ('opera'), ('pagode'), ('party'), ('philippines-opm'),
        ('piano'), ('pop'), ('pop-film'), ('post-dubstep'), ('power-pop'),
        ('progressive-house'), ('psych-rock'), ('punk'), ('punk-rock'), ('r-n-b'),
        ('rainy-day'), ('reggae'), ('reggaeton'), ('road-trip'), ('rock'),
        ('rock-n-roll'), ('rockabilly'), ('romance'), ('sad'), ('salsa'),
        ('samba'), ('sertanejo'), ('show-tunes'), ('singer-songwriter'), ('ska'),
        ('sleep'), ('songwriter'), ('soul'), ('soundtracks'), ('spanish'),
        ('study'), ('summer'), ('swedish'), ('synth-pop'), ('tango'),
        ('techno'), ('trance'), ('trip-hop'), ('turkish'), ('work-out'),
        ('world-music');
    """,
    """
    CREATE TABLE IF NOT EXISTS playlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT NOT NULL
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS stages (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        host_id INTEGER NOT NULL REFERENCES users(id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS stage_playlists (
        stage_id INTEGER NOT NULL REFERENCES stages(id),
        playlist_id INTEGER NOT NULL REFERENCES playlists(id),
        PRIMARY KEY (stage_id, playlist_id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS playlist_songs (
        playlist_id INTEGER NOT NULL REFERENCES playlists(id),
        song_id INTEGER NOT NULL REFERENCES songs(id),
        PRIMARY KEY (playlist_id, song_id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS stage_participants (
        stage_id INTEGER NOT NULL REFERENCES stages(id),
        participant_id INTEGER REFERENCES users(id),
        PRIMARY KEY (stage_id, participant_id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS stage_genres (
        stage_id INTEGER NOT NULL REFERENCES stages(id),
        genre_id INTEGER REFERENCES genres(id),
        PRIMARY KEY (stage_id, genre_id)
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        stage_id INTEGER NOT NULL REFERENCES stages(id),
        sender_id INTEGER NOT NULL REFERENCES users(id),
        message TEXT NOT NULL
    );
    """
]
]
