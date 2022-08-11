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
    test('accept calls confirm', async ()=> {
      const onConfirm = jest.fn();
      render(
          <ConfirmDialog
            ref={ref}
            title='dummy'
            show={true}
            onAccepted={onConfirm}/>,
      );
      if (!ref.current) {
        fail('The ref should be available by now');
      }
      const dialog = ref.current;
      await waitFor(()=>{
        dialog.accept();
        return screen.getByRole('dialog');
      });
      expect(onConfirm).toBeCalled();
    });
    test('cancel calls onCancel', async ()=> {
      const onCancel = jest.fn();
      render(
          <ConfirmDialog
            ref={ref}
            title='dummy'
            show={true}
            onCancel={onCancel}/>,
      );
      if (!ref.current) {
        fail('The ref should be available by now');
      }
      const dialog = ref.current;
      await waitFor(()=>{
        dialog.cancel();
        return screen.getByRole('dialog');
      });
      expect(onCancel).toBeCalled();
    });
    test('setting setOnCancel updates onCancel handel', async ()=> {
      const onCancel = jest.fn();
      render(<ConfirmDialog ref={ref} title='dummy' show={true} />);
      await waitFor(()=>{
        if (ref.current) {
          ref.current.setOnCancel(onCancel);
          ref.current.cancel();
        } else {
          fail('The ref should be available by now');
        }
      });
      expect(onCancel).toBeCalled();
    });
    test('setting setOnConfirm and running accept calls onConfirm', async ()=> {
      const onConfirm = jest.fn();
      render(<ConfirmDialog ref={ref} title='dummy' show={true} />);
      await waitFor(()=>{
        return screen.getByRole('dialog');
      });
      await waitFor(()=>{
        if (ref.current) {
          ref.current.setOnAccept(onConfirm);
          ref.current.accept();
        } else {
          fail('The ref should be available by now');
        }
      });
      await waitFor(()=>{
        return screen.getByRole('dialog');
      });
      expect(onConfirm).toBeCalled();
    });
    test('setting setOnConfirm without running accept does not call onConfirm',
        async ()=> {
          const onConfirm = jest.fn();
          render(<ConfirmDialog ref={ref} title='dummy' show={true} />);
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          await waitFor(()=>{
            if (ref.current) {
              ref.current.setOnAccept(onConfirm);
            } else {
              fail('The ref should be available by now');
            }
          });
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          expect(onConfirm).not.toBeCalled();
    });
  });
});
