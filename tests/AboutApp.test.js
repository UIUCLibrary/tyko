/**
 * @jest-environment jsdom
 */
import axios from 'axios';
import {
  render,
  cleanup,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import AboutApp from '../tyko/static/js/reactComponents/AboutApp';

const mockApplicationData = {
  server_color: 'blue',
  version: '0.0.1.dev1',
};
beforeEach(() => {
  axios.get = jest.fn(() => {});
});

afterEach(cleanup);
describe('AboutApp', () => {
  const {getByTestId} = render(<AboutApp apiUrl="/api"/>);
  it('header should exists ', () => {
    const header = getByTestId('header');
    expect(header).toBeTruthy();
  });

  it('displays text "loading" while fetching data', () => {
    axios.get.mockResolvedValueOnce({data: {data: mockApplicationData}});
    const {getByText} = render(<AboutApp apiUrl='/foo'/>);
    getByText('Loading...');
  });
  it('Removes text "Loading" after data has been fetched', async () => {
    axios.get.mockResolvedValueOnce({data: {data: mockApplicationData}});
    const {getByText} = render(<AboutApp apiUrl='/foo'/>);
    await waitForElementToBeRemoved(() => {
      return getByText('Loading...');
    });
  });
});

