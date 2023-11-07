import { getSession } from 'next-auth/react'

const hasRole = async (req, role) => {
  const session = await getSession({ req })
  return session && session.user && session.user.role === role
}

const getRole = async (req) => {
  const session = await getSession({ req })
  return session && session.user && session.user.role
}

const getUser = async (req) => {
  const session = await getSession({ req })
  return session && session.user
}

const getUserSelectedGroup = async (req) => {
  const session = await getSession({ req })
  return session && session.user && session.user.selected_group
}

export { hasRole, getRole, getUser, getUserSelectedGroup }
