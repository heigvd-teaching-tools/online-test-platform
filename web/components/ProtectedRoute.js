import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  } , [status, router]);
  
  return status === 'authenticated' ? <>{ children }</> : null;
}

export default ProtectedRoute;