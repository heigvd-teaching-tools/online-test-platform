import { signOut, useSession } from 'next-auth/react'
import { Role } from '@prisma/client'
import Unauthorized from './Unauthorized'
import { Button, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import {useGroup} from "../../context/GroupContext";
import UnauthorizedMissingGroups from "./UnauthorizedMissingGroups";

const Authorisation = ({ children, allowRoles = [] }) => {
  const { groups } = useGroup()

  const { data: session } = useSession()

  const [authorization, setAuthorization] = useState({
    hasAllowedRole: false,
    hasGroups: false,
  })

  useEffect(() => {
    if (session?.user) {
      setAuthorization({
        hasAllowedRole: allowRoles.includes(session.user.role),
        hasGroups: groups.length > 0,
      })
    }
  }, [groups, session, allowRoles])

  if (!authorization.hasAllowedRole) {
    return (
      <Unauthorized>
        <Typography variant="h6">
          You are not authorized to view this page.
        </Typography>
        <Button onClick={() => signOut()} variant="text" color="primary">
          Sign Out
        </Button>
      </Unauthorized>
    )
  }
    console.log("authorization.hasGroups", authorization.hasGroups)
  if (
    authorization.hasAllowedRole &&
    session.user.role === Role.PROFESSOR &&
    !authorization.hasGroups
  ) {
    return (
      <UnauthorizedMissingGroups />
    )
  }

  return children
}


export default Authorisation
