/**
 * @jest-environment jsdom
 */

'use strict';
import axios from 'axios';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {render, waitFor} from '@testing-library/react';
import Items, {
  CassetteOnlyData,
  FormatSpecificFields,
  NewItemModal,
} from '../tyko/static/js/reactComponents/Items';
import React from 'react';

jest.mock('vanillajs-datepicker', ()=>{});

describe('Items', ()=>{
  const items = [
    {
      files: [],
      format: {
        id: 1,
        name: 'audio cassette',
      },
      elements: [],
      format_details: {},
      format_id: 1,
      item_id: 1,
      name: 'bar',
      routes: {
        api: '/api/bar',
        frontend: '/bar',
      },
    },
  ];
  const {getByText} = render(
      <table>
        <tbody>
          <Items items={items}/>
        </tbody>
      </table>);
  test('include name', ()=>{
    expect(getByText('bar')).toBeInTheDocument();
  });
});
describe('NewItemModal', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/format') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo format',
                },
                {
                  id: 2,
                  name: 'bar format',
                },
              ],
            },
        );
      }
      return Promise.resolve({});
    });
  });
  test('has Select a Format', async ()=>{
    const {getByText} = render(<NewItemModal submitUrl="/foo" show={true}/>);
    await waitFor(()=> {
      expect(getByText(/Select a Format/)).toBeInTheDocument();
    });
  });
  test('selection', async ()=>{
    const {getByText, getByLabelText} = render(
        <NewItemModal submitUrl="/foo" show={true}/>
    );
    await waitFor(()=> {
      userEvent.selectOptions(getByLabelText('Format'), '2');
      expect((getByText('bar format') as HTMLOptionElement).selected).toBeTruthy();
    });
  });
});

describe('FormatSpecificFields', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/audio_cassette/generation') {
        return Promise.resolve({data: [
          {
            id: 1,
            name: 'foo',
          },
          {
            id: 2,
            name: 'bar',
          },
        ]});
      }
      if (url === '/api/formats/audio_cassette/subtype') {
        return Promise.resolve({data: [
          {
            id: 2,
            name: 'bar',
          },
          {
            id: 3,
            name: 'baz',
          },
        ]});
      }
      return Promise.resolve({data: []});
    });
  });
  describe('audio cassette', ()=>{
    test('Title of Cassette', async ()=>{
      const type = {
        id: 1,
        name: 'audio cassette',
      };
      const {getByText} = render(<FormatSpecificFields type={type}/>);
      await waitFor(()=>{
        expect(getByText('Title of Cassette')).toBeInTheDocument();
      });
    });
  });
});
describe('CassetteOnlyData', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/audio_cassette/generation') {
        return Promise.resolve({data: [
          {
            id: 1,
            name: 'foo',
          },
          {
            id: 2,
            name: 'bar',
          },
        ]});
      }
      if (url === '/api/formats/audio_cassette/subtype') {
        return Promise.resolve({data: [
          {
            id: 2,
            name: 'bar',
          },
          {
            id: 3,
            name: 'baz',
          },
        ]});
      }
      return Promise.resolve({data: []});
    });
  });
  test('Title of Cassette', async ()=>{
    const {getByText} = render(<CassetteOnlyData/>);
    await waitFor(()=>{
      expect(getByText('Title of Cassette')).toBeInTheDocument();
    });
  });
});
