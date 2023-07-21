import { configureStore } from "@reduxjs/toolkit";

import { musicPlayerApi } from "./services/musicPlayerApi";
import playerReducer from "./features/playerSlice";

export const store = configureStore({
  reducer: {
    [musicPlayerApi.reducerPath]: musicPlayerApi.reducer,
    player: playerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(musicPlayerApi.middleware),
});
