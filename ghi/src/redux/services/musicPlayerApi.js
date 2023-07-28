import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const musicPlayerApi = createApi({
  reducerPath: "musicPlayerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_HOST,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        return {
          ...headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => "token",
    }),
    getSongById: builder.query({
      query: (song_id) => `songs/${song_id}`,
    }),
    getAllSongs: builder.query({
      query: () => "songs",
    }),
    createSong: builder.mutation({
      query: ({ uploader, title, artist, music_file, cover, genres }) => {
        const formData = new FormData();
        formData.append("uploader", uploader);
        formData.append("title", title);
        formData.append("artist", artist);
        formData.append("music_file", music_file);
        formData.append("cover", cover);
        if (genres) formData.append("genres", genres);

        return {
          url: "songs",
          method: "POST",
          body: formData,
        };
      },
    }),
    updateSong: builder.mutation({
      query: ({ song_id, title, artist, music_file, cover, genres }) => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("artist", artist);
        formData.append("music_file", music_file);
        formData.append("cover", cover);
        if (genres) formData.append("genres", genres);

        return {
          url: `songs/${song_id}`,
          method: "PUT",
          body: formData,
        };
      },
    }),
    deleteSong: builder.mutation({
      query: (song_id) => ({
        url: `songs/${song_id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetSongByIdQuery,
  useGetAllSongsQuery,
  useCreateSongMutation,
  useUpdateSongMutation,
  useDeleteSongMutation,
  useGetUserQuery,
} = musicPlayerApi;