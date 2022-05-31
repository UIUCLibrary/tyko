/**
 * @jest-environment jsdom
 */
// import renderer from 'react-test-renderer';
import {render} from "@testing-library/react"
import {AboutApp, AboutHeader} from '../tyko/static/js/reactComponents/about';

describe('AboutApp', () =>{
  const {getByTestId} = render(<AboutApp apiUrl="/api"/>);
  const header = getByTestId('header');
  it('should ', () => {
    expect(header).toBeTruthy();
  });
});
