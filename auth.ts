import NextAuth from 'next-auth'
import Slack from "next-auth/providers/slack"


export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Slack],
    callbacks: {
      jwt({token, user, profile}) {
        if (profile) {
          token.sub = profile?.sub as string;
        }
        return token;
      },
      session({ session, token, user }) {
        session.user.id = token.sub as string;
            return session
      },
    }
  })