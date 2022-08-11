/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {
  EditableListElement,
  Treatment,
  TreatmentDialog,
  TreatmentDialogRef,
  TreatmentType,
} from '../tyko/static/js/reactComponents/Treatment';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React from 'react';

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
describe('EditableListElement', ()=>{
  test('element', ()=>{
    const elements = [
      {
        id: 1,
        content: 'bar',
      },
    ];
    render(
        <>
          <EditableListElement
            label={'foo'}
            elements={elements}
            editMode={true}
          />
        </>,
    );
    expect(screen.getByText('bar')).toBeInTheDocument();
  });
});

describe('TreatmentDialog', ()=>{
  test('title', ()=>{
    render(<TreatmentDialog title={'foo'} show={true}/>);
    expect(screen.getByText('foo')).toBeInTheDocument();
  });
  describe('ref', ()=> {
    const ref = React.createRef<TreatmentDialogRef>();
    test('update title', async ()=> {
      render(
          <>
            <TreatmentDialog ref={ref} title='dummy' show={true}/>
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
            <TreatmentDialog ref={ref} title='dummy' show={false}/>
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
    test('cancel calls onCancel', async ()=> {
      const onCancel = jest.fn();
      render(
          <TreatmentDialog
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
        dialog.reject();
      });
      expect(onCancel).toBeCalled();
    });
    test('okay calls accept', async ()=> {
      const onAccepted = jest.fn();
      render(
          <TreatmentDialog
            ref={ref}
            title='dummy'
            show={true}
            onAccepted={onAccepted}
          />,
      );
      if (!ref.current) {
        fail('The ref should be available by now');
      }
      const dialog = ref.current;
      await waitFor(()=>{
        dialog.setType(TreatmentType.Performed);
        dialog.accept();
      });
      expect(onAccepted).toBeCalled();
    });
    test('setting setOnConfirm and running accept calls onConfirm', async ()=> {
      const onAccepted = jest.fn();
      render(<TreatmentDialog ref={ref} title='dummy' show={true} />);
      await waitFor(()=>{
        return screen.getByRole('dialog');
      });
      await waitFor(()=>{
        if (ref.current) {
          ref.current.setType(TreatmentType.Performed);
          ref.current.setOnAccepted(onAccepted);
          ref.current.accept();
        } else {
          fail('The ref should be available by now');
        }
      });
      await waitFor(()=>{
        return screen.getByRole('dialog');
      });
      expect(onAccepted).toBeCalled();
    });
    test('setting setOnAccepted without running accept does not call onConfirm',
        async ()=> {
          const onAccepted = jest.fn();
          render(<TreatmentDialog ref={ref} title='dummy' show={true} />);
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          await waitFor(()=>{
            if (ref.current) {
              ref.current.setOnAccepted(onAccepted);
            } else {
              fail('The ref should be available by now');
            }
          });
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          expect(onAccepted).not.toBeCalled();
        });
    test(
        'setting setOnRejected and running accept calls onRejected',
        async ()=> {
          const onReject = jest.fn();
          render(<TreatmentDialog ref={ref} title='dummy' show={true} />);
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          await waitFor(()=>{
            if (ref.current) {
              ref.current.setType(TreatmentType.Performed);
              ref.current.setOnRejected(onReject);
              ref.current.reject();
            } else {
              fail('The ref should be available by now');
            }
          });
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          expect(onReject).toBeCalled();
        });
    test(
        'setting setOnRejected without running accept does not call ' +
        'onRejected',
        async ()=> {
          const onRejected = jest.fn();
          render(<TreatmentDialog ref={ref} title='dummy' show={true} />);
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          await waitFor(()=>{
            if (ref.current) {
              ref.current.setOnRejected(onRejected);
            } else {
              fail('The ref should be available by now');
            }
          });
          await waitFor(()=>{
            return screen.getByRole('dialog');
          });
          expect(onRejected).not.toBeCalled();
        });
  });
});
