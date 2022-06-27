import Navbar from 'react-bootstrap/Navbar';
import {Container} from 'react-bootstrap';
import Nav from 'react-bootstrap/Nav';

/**
 * TykoNavBar
 * @constructor
 */
export default function TykoNavBar() {
  return (
    <Navbar bg="light">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Container>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="/">Home</Nav.Link>
            <Nav.Link href="/about">About</Nav.Link>
            <Nav.Link href="/projects">Projects</Nav.Link>
            <Nav.Link href="/more">More</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
