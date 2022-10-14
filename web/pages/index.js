import LayoutMain from '../components/layout/LayoutMain';
import { Role } from "@prisma/client";
import Authorisation from "../components/security/Authorisation";

const Home = () => {
  return (
      <Authorisation allowRoles={[ Role.PROFESSOR ]}>
          <LayoutMain />
      </Authorisation>
  );
}

export default Home;