/**
 * @jest-environment jsdom
 */

'use strict';
import axios from 'axios';
import '@testing-library/jest-dom';
import {
  fireEvent,
  render, screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';

import {
  ItemDetails,
  EditableField, IItemMetadata,
} from '../tyko/static/js/reactComponents/ItemApp';

import React from 'react';
jest.mock('axios');

describe('ItemDetails', ()=>{
  const dummyData = {
    files: [],
    format: {
      name: 'foo',
      id: 1,
    },
    format_details: {},
    format_id: 1,
    name: 'dummy',
    barcode: null,
    obj_sequence: 1,
    item_id: 1,
    notes: [],
    parent_object_id: 1,
  };
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/dummy') {
        return Promise.resolve(
            {
              data: {
                item: {
                  name: 'dummy',
                  obj_sequence: 1,
                  format: {
                    name: 'foo',
                    id: 1,
                  },
                },
              },
            },
        );
      }
      if (url === '/api/bad') {
        return Promise.resolve(
            {
              data: {
                item: {
                  name: 'dummy',
                  obj_sequence: 1,
                },
              },
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('has Object Sequence', ()=>{
    const {getByText} = render(
        <ItemDetails apiData={dummyData} apiUrl="/api/dummy"/>,
    );
    expect(getByText('Object Sequence')).toBeInTheDocument();
  });
  test('has a name', async ()=>{
    const {getByText} = render(
        <ItemDetails apiData={dummyData} apiUrl="/api/dummy"/>,
    );

    await waitFor(()=> {
      expect(getByText('Name')).toBeInTheDocument();
    });
  });

  describe('invalid', ()=>{
    test('error message on bad parsing', async ()=>{
      const consoleErrorMock = jest.spyOn(
          global.console,
          'error',
      ).mockImplementation();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const badData: IItemMetadata = {'gabage': '1212'};
      const {getByText} = render(
          <ItemDetails apiData={badData} apiUrl="/api/bad"/>,
      );
      await waitFor(()=> {
        expect(getByText('Failed to load the data')).toBeInTheDocument();
      });

      consoleErrorMock.mockRestore();
    });
  });
});
describe('barcode field', ()=>{
  const dummyData = {
    name: 'sample',
    barcode: '123',
    format: {
      name: 'foo',
      id: 1,
    },
    files: [],
    format_details: {},
    format_id: 1,
    item_id: 1,
    notes: [],
    obj_sequence: 1,
    parent_object_id: 1,
  };
  test('editable', ()=>{
    render(
        <ItemDetails apiData={dummyData} apiUrl="/api/dummy"/>,
    );
    const barcodeField = screen.getByLabelText('Barcode');
    expect(barcodeField).toHaveAttribute('readonly', '');
    const barcodeEditButton = screen.getByTestId('edit-button-barcode');
    fireEvent.click(barcodeEditButton);
    expect(barcodeField).not.toHaveAttribute('readonly');
  });
  test('submits', async ()=>{
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    const onUpdated = jest.fn();

    render(
        <ItemDetails
          apiData={dummyData}
          apiUrl='/api/dummy'
          onUpdated={onUpdated}
        />,
    );
    const barcodeField = screen.getByLabelText('Barcode');
    fireEvent.click(screen.getByTestId('edit-button-barcode'));
    fireEvent.change(barcodeField, {target: {value: '1234'}});
    fireEvent.click(screen.getByTestId('confirm-button-barcode'));
    expect(barcodeField).toBeInTheDocument();
    expect(mockedAxios.put).toBeCalledWith(
        expect.stringMatching('/api/dummy'),
        expect.objectContaining({'barcode': '1234'}),
    );
    await waitFor(()=>{
      expect(onUpdated).toHaveBeenCalled();
    });
    // expect(onUpdated.mock.calls.length).toBeGreaterThan(0)
  });
});
describe('EditableField', ()=>{
  test('display', ()=>{
    const {getByDisplayValue} = render(<EditableField display="Dummy"/>);
    expect(getByDisplayValue('Dummy')).toBeInTheDocument();
  });
  test('Edit button', ()=>{
    const {getByText} = render(<EditableField display="Dummy"/>);
    expect(getByText('Edit')).toBeInTheDocument();
  });
  test('Confirm button calls onSubmit', async ()=>{
    const submit = jest.fn();
    const {getByText} = render(
        <EditableField display="Dummy" onSubmit={submit}/>,
    );

    await waitFor(()=> {
      fireEvent.click(getByText('Edit'));
    });
    const confirmButton = getByText('Confirm');

    expect(confirmButton).toBeInTheDocument();
    await waitFor(()=> {
      fireEvent.click(confirmButton);
    });
    expect(submit).toBeCalled();
  });
  test('Cancel button brings back view mode', async ()=>{
    const {getByText} = render(
        <EditableField display="Dummy"/>,
    );

    await waitFor(()=> {
      fireEvent.click(getByText('Edit'));
      fireEvent.click(getByText('Cancel'));
    });
    expect(getByText('Edit')).toBeInTheDocument();
  });
  test('Clicking outside of area when in edit more cancels', async ()=>{
    const {getByText} = render(
        <EditableField display="Dummy"/>,
    );

    await waitFor(()=> {
      fireEvent.click(getByText('Edit'));
      fireEvent.blur(getByText('Confirm'));
    });
    expect(getByText('Edit')).toBeInTheDocument();
  });
});
