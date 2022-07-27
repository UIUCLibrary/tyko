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
} from '@testing-library/react';

import {
  ItemDetails,
  EditableField,
} from '../tyko/static/js/reactComponents/ItemApp';

import React from 'react';
jest.mock('axios');

describe('ItemDetails', ()=>{
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
        <ItemDetails
          objectName='dummy'
          objectSequence={1}
          formatName='grooved disc'
          apiUrl="/api/dummy"/>,
    );
    expect(getByText('Object Sequence')).toBeInTheDocument();
  });
  test('has a name', async ()=>{
    render(
        <ItemDetails
          objectName='dummy'
          objectSequence={1}
          formatName='grooved disc'
          apiUrl="/api/dummy"/>,
    );

    await waitFor(()=> {
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
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
        <ItemDetails
          objectName='sample'
          barcode='123'
          objectSequence={1}
          formatName='foo'
          apiUrl="/api/dummy"/>,
    );
    expect(screen.getByLabelText('Barcode').nodeName).not.toBe('INPUT');
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByLabelText('Barcode').nodeName).toBe('INPUT');
  });
  test('submits', async ()=>{
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.put.mockResolvedValue({data: []});
    const onUpdated = jest.fn();

    render(
        <ItemDetails
          objectName='sample'
          barcode='123'
          objectSequence={1}
          formatName='foo'
          onUpdated={onUpdated}
          apiUrl="/api/dummy"/>,
    );
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.change(
        screen.getByLabelText('Barcode'),
        {
          target: {value: '1234'},
        },
    );
    fireEvent.click(screen.getByText('Confirm'), {target: {value: '1234'}});
    expect(screen.getByLabelText('Barcode')).toBeInTheDocument();
    expect(mockedAxios.put).toBeCalledWith(
        expect.stringMatching('/api/dummy'),
        expect.objectContaining({'barcode': '1234'}),
    );
    await waitFor(()=>{
      expect(onUpdated).toHaveBeenCalled();
    });
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
