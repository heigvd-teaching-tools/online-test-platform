import LayoutMain from '../components/layout/LayoutMain';
import { Role } from "@prisma/client";
import Authorisation from "../components/security/Authorisation";
import MainMenu from "../components/layout/MainMenu";

const Home = () => {
  return (
      <Authorisation allowRoles={[ Role.PROFESSOR ]}>
          <LayoutMain header={ <MainMenu /> } />
      </Authorisation>
  );
}

export default Home;
