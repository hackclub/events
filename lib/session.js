export const sessionOptions = {
  password: process.env.SESSION_SECRET,
  cookieName: 'hc-evenets-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
  }
}
