import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"

const getSession = async (req, res) => {
  const session = await getServerSession(req, res, authOptions)
  return session
}

const getRoles = async (req, res) => {
  const session = await getSession(req, res)
  return session && session.user && session.user.roles
}

const getUser = async (req, res) => {
  const session = await getSession(req, res)
  return session && session.user
}

export { getRoles, getUser }
