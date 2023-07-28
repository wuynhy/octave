import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import { musicPlayerApi } from "./services/musicPlayerApi";
import playerReducer from "./features/playerSlice";
import songReducer from "./features/songSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    player: playerReducer,
    song: songReducer,
    [musicPlayerApi.reducerPath]: musicPlayerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(musicPlayerApi.middleware),
});
