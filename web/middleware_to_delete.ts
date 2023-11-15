import { Role } from '@prisma/client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSession } from 'next-auth/react'
 
const pathAccessControl = {
    '/api/evaluation/(.*)/students': {
        'GET': [Role.PROFESSOR]
    }
}

const matchersArray = Object.keys(pathAccessControl)

// This function can be marked `async` if using `await` inside

export async function middleware(request: NextRequest) {
  
    const method = request.method
    const path = matchersArray.find((m) => request.nextUrl.pathname.match(m))
    if (path) {
        console.log("middleware", path, method, pathAccessControl[path][method])
    }
}

// See "Matching Paths" below to learn more

export const config = {
    matcher: matchersArray
}
