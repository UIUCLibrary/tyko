/**
 * @jest-environment jsdom
 */

'use strict';
import axios from 'axios';
import '@testing-library/jest-dom';
import {
  fireEvent,
  render,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import {ItemDetails, EditableField} from '../tyko/static/js/reactComponents/ItemApp';
import React from 'react';

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
  test('has Details title', async ()=>{
    const {getByText} = await waitFor(async ()=> {
      const element = render(<ItemDetails apiUrl="/api/dummy"/>);
      await waitForElementToBeRemoved(()=>element.getByText('Loading...'));
      return element;
    });
    expect(getByText('Details')).toBeInTheDocument();
  });
  test('has a name', async ()=>{
    const {getByText} = await waitFor(async ()=> {
      const element = render(<ItemDetails apiUrl="/api/dummy"/>);
      await waitForElementToBeRemoved(()=>element.getByText('Loading...'));
      return element;
    });
    await waitFor(()=> {
      expect(getByText('Name')).toBeInTheDocument();
    });
  });

  describe('invalid', ()=>{
    test('error message on bad fetch', async ()=>{
      const {getByText} = await waitFor(async ()=> {
        const element = render(<ItemDetails apiUrl="/api/invalid"/>);
        await waitForElementToBeRemoved(()=>element.getByText('Loading...'));
        return element;
      });
      await waitFor(()=> {
        expect(getByText('Failed to load the data')).toBeInTheDocument();
      });
    });
    test('error message on bad parsing', async ()=>{
      const consoleErrorMock = jest.spyOn(
          global.console,
          'error',
      ).mockImplementation();

      const {getByText} = await waitFor(async ()=> {
        const element = render(<ItemDetails apiUrl="/api/bad"/>);
        await waitForElementToBeRemoved(()=>element.getByText('Loading...'));
        return element;
      });
      await waitFor(()=> {
        expect(getByText('Failed to load the data')).toBeInTheDocument();
      });

      consoleErrorMock.mockRestore();
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
});
