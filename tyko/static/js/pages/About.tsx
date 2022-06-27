import TykoNavBar from '../reactComponents/TykoNavBar';
import AboutApp from '../reactComponents/AboutApp';
/**
 * @return {JSXElement}
 */
export default function About() {
  return <div>
    <TykoNavBar/>
    <AboutApp apiUrl={'/api/application_data'}/>
  </div>;
}
