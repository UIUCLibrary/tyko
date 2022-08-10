/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {
  EditableListElement,
  ITreatment,
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
//   test('ss', ()=>{
//     const apiData= {
//       files: [],
//       format: {
//         id: 1,
//         name: 'string',
//       },
//       format_details: {},
//       format_id: 1,
//       item_id: 1,
//       name: 'string',
//       notes: [],
//       barcode: null,
//       obj_sequence: 1,
//       parent_object_id: 1,
//       treatment: [
//         {
//           item_id: 1,
//           message: 'foo',
//           treatment_id: 1,
//           type: 'needed',
//         },
//         {
//           item_id: 1,
//           message: 'bar',
//           treatment_id: 2,
//           type: 'done',
//         },
//       ],
//     };
//     render(<Treatment apiUrl='/foo' apiData={apiData}/>);
//     expect(screen.getByText('bar')).toBeInTheDocument();
//     fireEvent.click(screen.getByText('Edit'));
//   });
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
