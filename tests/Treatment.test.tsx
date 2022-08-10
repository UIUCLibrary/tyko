/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {
  EditableListElement,
  TreatmentDialog,
  Treatment,
} from '../tyko/static/js/reactComponents/Treatment';
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
});
