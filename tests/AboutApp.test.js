/**
 * @jest-environment jsdom
 */
import renderer from 'react-test-renderer';
import {AboutApp} from '../tyko/static/js/reactComponents/about';

describe('AboutApp', () =>{
  const component = renderer.create(
      <AboutApp apiUrl="/api"/>,
  );
  const testInstance = component.root;
  test('has header', ()=>{
    const header = testInstance.findByType('h1');
    expect(header.props.children).toBe('About Tyko');
  });
});
