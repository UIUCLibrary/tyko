/**
 * @jest-environment jsdom
 */

'use strict';
import axios from 'axios';
import '@testing-library/jest-dom';
import {
  render,
  waitFor,
  fireEvent,
  screen,
} from '@testing-library/react';
import {VendorDataEdit} from '../tyko/static/js/reactComponents/Vendor';

jest.mock('vanillajs-datepicker', ()=>{});

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
mockedAxios.put.mockResolvedValue({data: 'ok'})
describe('VendorDataEdit', ()=>{
  test('calls onUpdate', async ()=>{
    const onUpdate = jest.fn();
    render(
        <VendorDataEdit
          vendorName='Bob'
          apiUrl='/api/dummy'
          onUpdated={onUpdate}
        />,
    );
    await waitFor(()=> {
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Confirm'));
    });
    await waitFor(()=>{
      expect(onUpdate).toBeCalled();
    });
  });
});
