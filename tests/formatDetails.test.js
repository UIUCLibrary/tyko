/**
 * @jest-environment jsdom
 */
import {render} from '@testing-library/react';
import {FormatDetails} from '../tyko/static/js/reactComponents/formatDetails';

describe('FormatDetails', () =>{
  const {getByTestId} = render(<FormatDetails/>);
  it('should have a display', ()=>{
    const display = getByTestId('display');
    expect(display).toBeTruthy();
  });
});
