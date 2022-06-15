/**
 * @jest-environment jsdom
 */
import axios from 'axios';
import {
  render,
  cleanup,
  waitForElementToBeRemoved, waitFor,
} from '@testing-library/react';
import AboutApp from '../tyko/static/js/reactComponents/AboutApp';

// const mockApplicationData = {
//   server_color: 'blue',
//   version: '0.0.1.dev1',
// };
beforeEach(() => {
  axios.get = jest.fn(() => {
    return Promise.resolve(
        {
          data: {
            server_color: 'blue',
            version: '0.0.1.dev1',
          },
        },
    );
  });
});

// afterEach(cleanup);
describe('AboutApp', () => {
  test('header should exists ', async () => {
    const {getByTestId} = render(<AboutApp apiUrl="/api"/>);
    await waitFor(async ()=>{
      expect(getByTestId('header')).toBeTruthy();
    });
  });

  it('displays text "loading" while fetching data', async () => {
    const {getByText} = render(<AboutApp apiUrl='/foo'/>);
    const loading = await waitFor(async ()=>{
      return getByText('Loading...');
    });
    expect(loading);
  });
  it('Removes text "Loading" after data has been fetched', async () => {
    const {getByText} = render(<AboutApp apiUrl='/foo'/>);
    await waitForElementToBeRemoved(() => {
      return getByText('Loading...');
    });
  });
});

