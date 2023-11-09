import { Role } from '@prisma/client'
import Authorisation from '../components/security/Authorisation'
import IndexPage from "../components/IndexPage";

const Home = () => {
  return (
    <Authorisation allowRoles={[Role.PROFESSOR]}>
      <IndexPage />
    </Authorisation>
  )
}

export default Home
