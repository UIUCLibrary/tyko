import TykoNavBar from '../reactComponents/TykoNavBar';
import {Outlet} from 'react-router-dom';
import {Container} from 'react-bootstrap';

/**
 * @return {JSXElement}
 */
export default function Home() {
  return <div>
    <TykoNavBar/>
    <Container>
      <Outlet />
    </Container>
  </div>;
}
