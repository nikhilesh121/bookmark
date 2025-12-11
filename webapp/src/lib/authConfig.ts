const ADMIN_SESSION_COOKIE_NAME = "admin_session" as const;

function getAdminJwtSecretKey() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error("ADMIN_JWT_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export { ADMIN_SESSION_COOKIE_NAME, getAdminJwtSecretKey };
