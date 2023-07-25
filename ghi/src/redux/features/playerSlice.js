import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentSongs: [],
  currentIndex: 0,
  isActive: false,
  isPlaying: false,
  activeSong: {},
  genreListId: "",
  token: null,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setActiveSong: (state, action) => {
      const { song = {}, data = [], i = 0 } = action.payload || {};
      if (song) {
        state.activeSong = song;
      }
      state.currentSongs = data;
      state.currentIndex = i;
      state.isActive = true;
    },

    nextSong: (state) => {
      let nextIndex = state.currentIndex + 1;
      if (nextIndex < state.currentSongs.length) {
        state.activeSong = state.currentSongs[nextIndex];
        state.currentIndex = nextIndex;
        state.isActive = true;
      }
    },

    prevSong: (state) => {
      let prevIndex = state.currentIndex - 1;
      if (prevIndex >= 0) {
        state.activeSong = state.currentSongs[prevIndex];
        state.currentIndex = prevIndex;
        state.isActive = true;
      }
    },

    playPause: (state, action) => {
      state.isPlaying = action.payload;
    },

    selectGenreListId: (state, action) => {
      state.genreListId = action.payload;
    },

    setToken: (state, action) => {
      state.token = action.payload;
    },
  },
});

export const {
  setActiveSong,
  nextSong,
  prevSong,
  playPause,
  selectGenreListId,
  setToken,
} = playerSlice.actions;

export default playerSlice.reducer;
