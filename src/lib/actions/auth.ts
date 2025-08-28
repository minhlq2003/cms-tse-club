"use server";

import { auth, signIn, signOut } from "../auth";

export const loginWithGoogle = async () => {
  await signIn("google", { redirectTo: "/signin/google" });
};

export const logout = async () => {
  await signOut({ redirectTo: "/signin" });
};

export const isLogin = async () => {
  const session = await auth();
  return !!session;
};

export const getSessionUser = async () => {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }
  return session.user;
};
