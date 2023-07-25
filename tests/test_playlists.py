import unittest
from unittest.mock import patch, MagicMock
from api.queries.playlists import PlaylistRepository, PlaylistIn, PlaylistOut, Error


class TestPlaylistRepository(unittest.TestCase):
    def setUp(self):
        self.repository = PlaylistRepository()
        self.s3_client_mock = MagicMock()
        self.repository = PlaylistRepository()
        self.repository.s3_client = self.s3_client_mock

    def test_get_playlist_by_id(self):
        connection_mock = MagicMock()
        cursor_mock = MagicMock()
        connection_mock.cursor.return_value.__enter__.return_value = cursor_mock
        cursor_mock.fetchone.return_value = (
            1,
            "Test Playlist",
            "testuser",
            "Test description",
            "1,2",
            "https://s3.amazonaws.com/test-bucket/test_cover.jpg"
        )

        with patch("api.queries.playlists.pool.connection", return_value=connection_mock):
            playlist = self.repository.get_playlist_by_id(1)

        self.assertIsInstance(playlist, PlaylistOut)
        self.assertEqual(playlist.id, 1)
        self.assertEqual(playlist.name, "Test Playlist")
        self.assertEqual(playlist.owner, "testuser")
        self.assertEqual(playlist.description, "Test description")
        self.assertEqual(playlist.songs, ["1", "2"])  # assert that songs is a list of IDs
        self.assertEqual(playlist.cover_url, "https://s3.amazonaws.com/test-bucket/test_cover.jpg")

    def test_get_playlist_by_id_no_playlist(self):
        connection_mock = MagicMock()
        cursor_mock = MagicMock()
        connection_mock.cursor.return_value.__enter__.return_value = cursor_mock
        cursor_mock.fetchone.return_value = None

        with patch("api.queries.playlists.pool.connection", return_value=connection_mock):
            playlist = self.repository.get_playlist_by_id(9999)  # ID not existing

        self.assertIsNone(playlist)

    def test_delete_from_s3(self):
        with patch.object(self.repository.s3_client, "delete_object") as delete_object_mock:
            result = self.repository.delete_from_s3("test-bucket", "test.jpg")

        self.assertTrue(result)
        delete_object_mock.assert_called_once_with(Bucket="test-bucket", Key="test.jpg")


if __name__ == "__main__":
    unittest.main()
