import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import "@/store/api/register";
import { baseApi } from "@/store/api/base-api";
import authReducer from "./slices/authSlice";
import impressionPromptReducer from "./slices/impressionPromptSlice";
import libraryReducer from "./slices/librarySlice";
import toastReducer from "./slices/toastSlice";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    impressionPrompt: impressionPromptReducer,
    auth: authReducer,
    library: libraryReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
