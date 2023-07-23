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
      state.activeSong = action.payload.song;
      state.currentSongs = action.payload.data; // directly set the songs array
      state.currentIndex = action.payload.i;
      state.isActive = true;
    },

    nextSong: (state) => {
      let nextIndex = state.currentIndex + 1;
      if (nextIndex < state.currentSongs.duration) {
        state.activeSong = state.currentSongs[nextIndex];
        state.currentIndex = nextIndex;
        state.isActive = true;
      } // Optionally loop back to the start or handle according to your requirements
    },

    prevSong: (state) => {
      let prevIndex = state.currentIndex - 1;
      if (prevIndex >= 0) {
        state.activeSong = state.currentSongs[prevIndex];
        state.currentIndex = prevIndex;
        state.isActive = true;
      } // Optionally loop back to the end or handle according to your requirements
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
