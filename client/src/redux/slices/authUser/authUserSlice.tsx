//userSlice.jsx

"use client";

import { createSlice } from "@reduxjs/toolkit";

export interface UserState {
  isAuthenticated: boolean,
  userId: string,
  username: string,
  email: string,
  fullname: string,
  avatarUrl: string,
  isOnline: boolean,
  twoFactorEnabled: boolean,
  coalitionName: string,
  accessToken: string,
}

export const initialState = {
  isAuthenticated: false,
  userId: null,
  username: null,
  email: null,
  fullname: null,
  avatarUrl: null,
  isOnline: false,
  twoFactorEnabled: false,
  coalitionName: null,
  accessToken: null,
};

export const userSlice = createSlice({
  name: "authUser",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.isAuthenticated = action?.payload?.isAuthenticated;
      state.userId = action?.payload?.userId;
      state.username = action.payload?.username;
      state.email = action.payload?.email;
      state.fullname = action.payload?.fullname;
      state.avatarUrl = action.payload?.avatarUrl;
      state.isOnline = action.payload?.isOnline;
      state.twoFactorEnabled = action.payload?.twoFactorEnabled;
      state.coalitionName = action.payload?.coalitionName;
      state.accessToken = action.payload?.accessToken;
    }
  },
});

export const { updateUser } = userSlice.actions;

export default userSlice.reducer;
