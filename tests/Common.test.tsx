/**
 * @jest-environment jsdom
 */
'use strict';
import '@testing-library/jest-dom';
import {screen, render} from '@testing-library/react';
import {ConfirmDialog} from '../tyko/static/js/reactComponents/Common';
describe('ConfirmDialog', ()=>{
  test('Title', ()=>{
    render(<ConfirmDialog title='dummy' show={true}/>);
    expect(screen.getByText('dummy')).toBeInTheDocument();
  });
});
