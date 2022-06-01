/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react';
import AboutApp from '../tyko/static/js/reactComponents/about';

describe('AboutApp', () =>{
  const {getByTestId} = render(<AboutApp apiUrl="/api"/>);
  it('header should exists ', () => {
    const header = getByTestId('header');
    expect(header).toBeTruthy();
  });
});
