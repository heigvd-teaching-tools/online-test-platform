// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  const session = await getSession({req})

  if(session) {
    res.status(200).json({ name: 'John Doe' })
  } else {
    res.status(401).json({ message: 'Unauthorized' })
  }
}
