steps = [
    [
        # "Up" SQL statement
        """
        INSERT INTO songs VALUES
        (8, 3, 'Song 1', 'Tom Yamaguchi', 
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/Song1.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/tomsong.jpg',178),
        (9, 3, 'Song 2', 'Tom Yamaguchi',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/Song2.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/tomsong.jpg', 235),
        (10, 3, 'Song 3', 'Tom Yamaguchi',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/Song3.mp3',
        'https://myoctavebucket.s3.us-west-1.amazonaws.com/tomsong.jpg', 251);
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
        (8, 3),
        (9, 3),
        (10, 3),
        (8, 4),
        (9, 4),
        (10, 4),
        (8, 100),
        (9, 100),
        (10, 100);
        """,
        # "Down" SQL statement
        """
        DROP TABLE song_genres;
        """,
    ]
]