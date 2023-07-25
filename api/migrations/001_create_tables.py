steps = [
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            avatar TEXT DEFAULT 'default_avatar.jpg',
            bio TEXT DEFAULT '',
            friends_count INTEGER DEFAULT 0,
            following_count INTEGER DEFAULT 0
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE users;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS friendships (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
            friend_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
            status TEXT NOT NULL
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE friendships;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS songs (
            id SERIAL PRIMARY KEY,
            uploader INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            artist TEXT NOT NULL,
            music_file TEXT NOT NULL,
            cover TEXT DEFAULT 'default_cover_art.jpg',
            duration INTEGER NOT NULL
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE songs;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS genres (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE genres;
        """,
    ],
    [
        # "Up" SQL statement
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
        # "Down" SQL statement
        """
        DELETE FROM genres;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS song_genres (
            song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
            genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
            PRIMARY KEY (song_id, genre_id)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE song_genres;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS playlists (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            cover TEXT DEFAULT 'default_playlist_art.jpg'
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE playlists;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS stages (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            host_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            cover TEXT DEFAULT 'default_stage_art.jpg'
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE stages;
        """,
    ],
    [   
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS stage_playlists (
            stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
            playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
            PRIMARY KEY (stage_id, playlist_id)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE stage_playlists;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS playlist_songs (
            playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
            song_id INTEGER NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
            PRIMARY KEY (playlist_id, song_id)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE playlist_songs;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS stage_participants (
            stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
            participant_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            PRIMARY KEY (stage_id, participant_id)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE stage_participants;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS stage_genres (
            stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
            genre_id INTEGER REFERENCES genres(id) ON DELETE CASCADE,
            PRIMARY KEY (stage_id, genre_id)
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE stage_genres;
        """,
    ],
    [
        # "Up" SQL statement
        """
        CREATE TABLE IF NOT EXISTS chats (
            id SERIAL PRIMARY KEY,
            stage_id INTEGER NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
            sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL
        );
        """,
        # "Down" SQL statement
        """
        DROP TABLE chats;
        """,
    ],
]
