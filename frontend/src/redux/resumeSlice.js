import { createSlice } from "@reduxjs/toolkit";

const resumeSlice = createSlice({
    name: "resume",
    initialState: {
        resumes: [],
        singleResume: null,
        loading: false,
    },
    reducers: {
        setResumes: (state, action) => {
            state.resumes = action.payload;
        },
        setSingleResume: (state, action) => {
            state.singleResume = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        }
    }
});

export const { setResumes, setSingleResume, setLoading } = resumeSlice.actions;
export default resumeSlice.reducer;
