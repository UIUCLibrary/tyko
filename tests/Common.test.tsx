/**
 * @jest-environment jsdom
 */
'use strict';
import '@testing-library/jest-dom';
import {screen, render, waitFor} from '@testing-library/react';
import {
  ConfirmDialog,
  RefConfirmDialog,
} from '../tyko/static/js/reactComponents/Common';
import React from 'react';
describe('ConfirmDialog', ()=>{
  test('Title', ()=>{
    render(<ConfirmDialog title='dummy' show={true}/>);
    expect(screen.getByText('dummy')).toBeInTheDocument();
  });
  describe('ref', ()=>{
    const ref = React.createRef<RefConfirmDialog>();
    test('update title', async ()=> {
      render(
          <>
            <ConfirmDialog ref={ref} title='dummy' show={true}/>
          </>,
      );
      expect(ref.current).toBeTruthy();
      const newTitle = await waitFor(()=>{
        if (ref.current) {
          ref.current?.setTitle('newTitle');
        }
        return screen.getByText('newTitle');
      });
      expect(newTitle).toBeInTheDocument();
    });
    test('update set visible', async ()=> {
      render(
          <>
            <ConfirmDialog ref={ref} title='dummy' show={false}/>
          </>,
      );
      if (!ref.current) {
        fail('The ref should be available by now');
      }
      const dialog = ref.current;
      expect(dialog.visible).toBe(false);
      await waitFor(()=>{
        dialog.setShow(true);
        return screen.getByRole('dialog');
      });
      expect(ref.current.visible).toBe(true);
    });
  });
});
