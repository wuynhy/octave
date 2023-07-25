import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./features/authSlice";
import { musicPlayerApi } from "./services/musicPlayerApi";
import playerReducer from "./features/playerSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    [musicPlayerApi.reducerPath]: musicPlayerApi.reducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(musicPlayerApi.middleware),
});
