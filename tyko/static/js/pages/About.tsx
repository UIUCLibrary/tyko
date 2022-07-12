import AboutApp from '../reactComponents/AboutApp';
/**
 * @return {JSXElement}
 */
export default function About() {
  return (
    <div>
      <AboutApp apiUrl={'/api/application_data'}/>
    </div>
  );
}
