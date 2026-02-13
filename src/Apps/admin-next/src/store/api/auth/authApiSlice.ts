import { apiSlice } from "../apiSlice";

export interface RegisterUserRequest {
  email: string;
  password: string;
  name?: string;
  [key: string]: any;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerUser: builder.mutation<AuthResponse, RegisterUserRequest>({
      query: (user) => ({
        url: "register",
        method: "POST",
        body: user,
      }),
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: "",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useRegisterUserMutation, useLoginMutation } = authApi;
