import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import jobSlice from "./jobSlice";
import {
    persistReducer,
    createTransform,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import companySlice from "./companySlice";
import applicationSlice from "./applicationSlice";

const authTransform = createTransform(
    (inboundState, key) => {
        if (key === "auth") {
            return { ...inboundState, loading: false };
        }
        return inboundState;
    },
    (outboundState, key) => {
        if (key === "auth") {
            return { ...outboundState, loading: false };
        }
        return outboundState;
    }
);

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    transforms: [authTransform],
}

const rootReducer = combineReducers({
    auth: authSlice,
    job: jobSlice,
    company: companySlice,
    application: applicationSlice
})

const persistedReducer = persistReducer(persistConfig, rootReducer)


const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export default store;
