import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  isAuth: boolean;
}

// Safe localStorage access for SSR
const storedUser: User | null =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("user") || "null")
    : null;

const initialState: AuthState = {
  user: storedUser || null,
  isAuth: !!storedUser,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuth = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    logOut: (state) => {
      state.user = null;
      state.isAuth = false;
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
    },
  },
});

export const { setUser, logOut } = authSlice.actions;
export default authSlice.reducer;
