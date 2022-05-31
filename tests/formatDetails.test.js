/**
 * @jest-environment jsdom
 */
import {screen, render} from '@testing-library/react';
import {FormatDetails} from '../tyko/static/js/reactComponents/formatDetails';
import '@testing-library/jest-dom';


describe('FormatDetails', () => {
  beforeEach(() => {
    jest.mock('../tyko/static/js/__mocks__/axios');
  });

  it('should have a display', async ()=>{
    render(<FormatDetails apiUrl='/foo'/>);
    const display = await screen.findByTestId('display');
    expect(display).toBeInTheDocument();
  });
});
