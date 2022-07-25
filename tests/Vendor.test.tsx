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

describe('VendorDataEdit', ()=>{
  const mockedAxios = axios as jest.Mocked<typeof axios>;
  test('put', async ()=> {
    const onUpdate = jest.fn();
    mockedAxios.put.mockResolvedValue({data: 'ok'});
    render(
        <VendorDataEdit
          vendorName='Bob'
          apiUrl='/api/dummy'
          onUpdated={onUpdate}
        />,
    );
    await waitFor(()=> {
      fireEvent.click(screen.getByText('Edit'));
    });
    fireEvent.change(
        screen.getByLabelText('Originals Received Date'),
        {
          target: {
            value: '4/22/1999',
          },
        },
    );

    await waitFor(()=> {
      fireEvent.click(screen.getByText('Confirm'));
    });
    await waitFor(()=>{
      expect(mockedAxios.put).toBeCalledWith(
          expect.stringMatching('/api/dummy'),
          expect.objectContaining(
              {
                'vendor_name': 'Bob',
                'originals_received_date': '4/22/1999',
              },
          ),
      );
    });
  });
  test('calls onUpdate', async ()=>{
    mockedAxios.put.mockResolvedValue({data: 'ok'});
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
