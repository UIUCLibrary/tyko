/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {Files} from '../tyko/static/js/reactComponents/Files';
import {fireEvent, render, screen} from '@testing-library/react';

describe('Files', ()=> {
  test('Edit button', ()=>{
    render(<Files apiUrl='/foo'/>);
    expect(screen.getByText('Edit')).toBeVisible();
  });
  test('edit mode switches', ()=>{
    render(<Files apiUrl='/foo'/>);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit')).not.toBeVisible();
  });
  test('edit mode switches back', ()=>{
    render(<Files apiUrl='/foo'/>);
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Done'));
    expect(screen.getByText('Edit')).toBeVisible();
  });
});
