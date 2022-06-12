/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {render, waitFor} from '@testing-library/react';
import Items, {
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
        name: 'foo format',
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
  test('has Select a Format', ()=>{
    const {getByText} = render(<NewItemModal submitUrl="/foo" show={true}/>);
    expect(getByText(/Select a Format/)).toBeInTheDocument();
  });
});

describe('FormatSpecificFields', ()=>{
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
})
