import { createSlice } from "@reduxjs/toolkit";

const songSlice = createSlice({
  name: "song",
  initialState: {
    songUploaded: false,
  },
  reducers: {
    uploadedSong: (state) => {
      state.songUploaded = !state.songUploaded;
    },
  },
});

export const { uploadedSong } = songSlice.actions;

export default songSlice.reducer;
