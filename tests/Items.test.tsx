/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {render} from '@testing-library/react';
import Items from '../tyko/static/js/reactComponents/Items';
import React from 'react';
jest.mock('vanillajs-datepicker', ()=>{

})
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
  const {getByText} = render(<Items items={items}/>);
  test('include name', ()=>{
    expect(getByText('bar')).toBeInTheDocument();
  });
});
