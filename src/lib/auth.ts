export const SESSION_COOKIE = "spark_session";

/**
 * The whole app sits behind one password, so the session cookie is just a
 * digest of that password. Change APP_PASSWORD and every old cookie dies.
 */
export async function sessionToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(`spark:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Length-independent equality check so we don't leak timing on the compare. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function isValidSession(
  cookieValue: string | undefined,
): Promise<boolean> {
  const password = process.env.APP_PASSWORD;
  if (!password || !cookieValue) return false;
  return safeEqual(cookieValue, await sessionToken(password));
}
