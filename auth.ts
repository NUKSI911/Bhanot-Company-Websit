import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { NextAuthConfig } from "next-auth";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      authorize: async (credentials) => {
        if (credentials === null) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        })
          console.log("user",user)
        if (user && user.password) {
          const isMatch = compareSync(
            credentials.password as string,
            user.password
          );
          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }
        }
        // if user does not exist or password does not match
        return null;
      },
    }),
  ],
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user, token, trigger }:any) {
      session.user.id = token.sub as string;
      session.user.role = token.role
      session.user.name = token.name
      if (trigger === "update") {
        session.user.name = user.name;
      }
      return session;
    },

// eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ session, user, token }:any) {
      session.user.id = token.sub as string;
      console.log("token",token,user)
      if(user){
        token.role = user.role
        token.id = user.id

      if (user?.name === "NO_NAME") {
        token.name = user?.email?.split("@")[0] ?? "";
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data:{
            name:token.name
          }
        });
      }
    }
      return token;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, signIn, signOut, auth } = NextAuth(config);