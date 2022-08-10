/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {
  EditableListElement,
  TreatmentDialog,
  Treatment, TreatmentDialogRef,
} from '../tyko/static/js/reactComponents/Treatment';
import {
  render,
  fireEvent,
  screen, waitFor,
} from '@testing-library/react';
import React from 'react';
import {ConfirmDialog} from 'Common';
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
  });
});
