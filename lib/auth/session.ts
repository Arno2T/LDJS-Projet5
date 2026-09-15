import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { redirect } from "next/navigation";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const createSession = async (userId: string): Promise<string> => {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10h")
    .sign(secret);

  return jwt;
};

export const setSessionCookie = async (token: string) => {
  const cookieStore = await cookies();

  cookieStore.set("userSession", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 10, // 10heures -
  });
};

export const getSession = async () => {
  const cookieStore = await cookies();

  const session = cookieStore.get("userSession");

  if (!session) {
    console.warn("Session :: no user session");
    return null;
  }

  try {
    const { payload } = await jwtVerify(session.value, secret);

    return payload.userId as string;
  } catch (error) {
    console.warn("Session :: no user session", error);
    return null;
  }
};

export const deleteSessionCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete("userSession");
};

export const requireAuth = async (): Promise<string> => {
  const userId = await getSession();

  if (!userId) {
    redirect("/login");
  }

  return userId;
};
