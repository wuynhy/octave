steps = [
    [
        # "Up" SQL statement
        """
        INSERT INTO songs VALUES
        (1, 8, 'seasons', 'wave to earth', 
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/spotifydown.com+-+seasons.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/seasons.jpeg', 256),
        (2, 8, 'Dissolve', 'Joji',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/spotifydown.com+-+Dissolve.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/dissolve.jpg', 177),
        (3, 8, 'Still With You', 'Jungkook',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/Still-With-You.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/swu.jpg', 239),
        (4, 9, 'instagram', 'dean',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/dean.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/dean.jpg', 256),
        (5, 9, 'The Less I Know The Better', 'Tame Impala',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/tame.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/tame.jpg', 218),
        (6, 9, 'Danielle (smile on my face)', 'Fred again..',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/fred.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/fred.jpg', 201),
        (7, 9, 'Bad Habits', 'Steve Lacy',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/lacy.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/lacy.jpg', 233);
        """,
        # "Down" SQL statement
        """
        DROP TABLE songs;
        """,
    ],
    [
        # "Up" SQL statement
        """
        INSERT INTO song_genres VALUES
        (1, 35),
        (1, 9),
        (2, 83),
        (2, 4),
        (3, 47),
        (3, 83), 
        (4, 83),
        (5, 50),
        (5, 4),
        (5, 77),
        (6, 35),
        (6, 26),
        (7, 35),
        (7, 83);
        """,
        # "Down" SQL statement
        """
        DROP TABLE song_genres;
        """,
    ],
]
