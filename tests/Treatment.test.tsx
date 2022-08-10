/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {Treatment} from '../tyko/static/js/reactComponents/Treatment';
import {
  render,
  fireEvent,
  screen,
} from '@testing-library/react';
describe('Treatment', ()=>{
  test('edit mode', ()=>{
    render(<Treatment apiUrl='/foo'/>);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit')).not.toBeVisible();
    expect(screen.getByText('Done')).toBeVisible();
  });
  test('edit mode out', ()=>{
    render(<Treatment apiUrl='/foo'/>);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit')).not.toBeVisible();
    fireEvent.click(screen.getByText('Done'));
    expect(screen.getByText('Edit')).toBeVisible();
  });
});
