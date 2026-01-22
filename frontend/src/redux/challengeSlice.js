import { createSlice } from "@reduxjs/toolkit";

const challengeSlice = createSlice({
    name: "challenge",
    initialState: {
        challenges: [],
        singleChallenge: null,
    },
    reducers: {
        setChallenges: (state, action) => {
            state.challenges = action.payload;
        },
        setSingleChallenge: (state, action) => {
            state.singleChallenge = action.payload;
        },
    }
});

export const { setChallenges, setSingleChallenge } = challengeSlice.actions;
export default challengeSlice.reducer;
