import NextAuth from 'next-auth'
import Slack from "next-auth/providers/slack"


export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [Slack],
  })