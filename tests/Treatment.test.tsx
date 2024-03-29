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
  TreatmentRef,
  TreatmentType,
} from '../tyko/static/js/reactComponents/Treatment';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import React, {createRef} from 'react';
import {IItemMetadata} from '../tyko/static/js/reactComponents/ItemApp';
import axios from 'axios';

jest.mock('axios');
describe('Treatment', ()=>{
  const sampleData: IItemMetadata = {
    obj_sequence: 0,
    treatment: [
      {
        type: 'done',
        message: 'foo',
        item_id: 1,
        treatment_id: 1,
      },
    ],
    barcode: null,
    files: [],
    format: {
      id: 4,
      name: 'open reel',
    },
    format_details: {
      base: null,
      date_of_reel: null,
      duration: null,
      format_subtype: null,
      generation: null,
      reel_brand: null,
      reel_diameter: null,
      reel_size: null,
      reel_speed: null,
      reel_thickness: null,
      reel_type: null,
      reel_width: null,
      title_of_reel: 'sample open reel',
      track_configuration: null,
      track_count: null,
      wind: null,
    },
    format_id: 4,
    item_id: 1,
    name: 'sample open reel',
    notes: [],
    parent_object_id: 1,
  };
  test('edit mode', ()=>{
    render(<Treatment apiUrl='/foo' apiData={sampleData}/>);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit')).not.toBeVisible();
    expect(screen.getByText('Done')).toBeVisible();
  });
  test('edit mode out', ()=>{
    render(<Treatment apiUrl='/foo' apiData={sampleData}/>);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByText('Edit')).not.toBeVisible();
    fireEvent.click(screen.getByText('Done'));
    expect(screen.getByText('Edit')).toBeVisible();
  });
  test('openNewDialog opens dialog', async () => {
    const treatmentRef = createRef<TreatmentRef>();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
        />,
    );
    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      expect(
          treatmentRef.current.treatmentsDialog.current?.visible,
      ).toBe(false);
      treatmentRef.current.openNewDialog(TreatmentType.Needed);
    });
    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      expect(treatmentRef.current.treatmentsDialog.current?.visible).toBe(true);
    });
  });
  test('add calls post', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.post.mockResolvedValue({data: []});
    const treatmentRef = createRef<TreatmentRef>();
    const onAccessibleChange=jest.fn();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
          onAccessibleChange={onAccessibleChange}
        />,
    );
    if (!treatmentRef.current) {
      fail('treatmentRef ref should be available by now');
    }
    expect(treatmentRef.current.editMode).toBe(false);
    expect(treatmentRef.current.treatmentsDialog.current?.visible)
        .toBe(false);

    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      treatmentRef.current.add(TreatmentType.Needed, 'dummy');
    });
    await waitFor(()=>expect(onAccessibleChange).toBeCalled());
    expect(mockedAxios.post).toBeCalledWith(
        expect.stringMatching('/foo'),
        expect.objectContaining(
            {'message': 'dummy', 'type': 'needed'},
        ),
    );
  });
  test('openEditDialog opens dialog', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.get.mockResolvedValue({data: []});
    const treatmentRef = createRef<TreatmentRef>();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
        />,
    );
    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      expect(treatmentRef.current.treatmentsDialog.current?.visible)
          .toBe(false);
      treatmentRef.current.openEditDialog(1, TreatmentType.Needed);
    });
    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      expect(treatmentRef.current.treatmentsDialog.current?.visible).toBe(true);
    });
  });
  test('edit calls put', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.put.mockResolvedValue({data: []});
    const treatmentRef = createRef<TreatmentRef>();
    const onAccessibleChange=jest.fn();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
          onAccessibleChange={onAccessibleChange}
        />,
    );
    if (!treatmentRef.current) {
      fail('treatmentRef ref should be available by now');
    }
    expect(treatmentRef.current.editMode).toBe(false);
    expect(treatmentRef.current.treatmentsDialog.current?.visible)
        .toBe(false);

    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      treatmentRef.current.edit(1, {
        type: TreatmentType.Performed,
        message: 'dummy'})
      ;
    });
    await waitFor(()=>expect(onAccessibleChange).toBeCalled());
    expect(mockedAxios.put).toBeCalledWith(
        expect.stringMatching('/foo'),
        expect.objectContaining(
            {'message': 'dummy', 'type': TreatmentType.Performed.toString()},
        ),
    );
  });
  test('error on put makes an error message', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.put
        .mockRejectedValueOnce(new Error('Async error message'))
        .mockResolvedValueOnce({data: ''});
    const treatmentRef = createRef<TreatmentRef>();
    const onAccessibleChange=jest.fn();
    const onError=jest.fn();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
          onAccessibleChange={onAccessibleChange}
          onError={onError}
        />,
    );
    if (!treatmentRef.current) {
      fail('treatmentRef ref should be available by now');
    }
    expect(treatmentRef.current.editMode).toBe(false);
    expect(treatmentRef.current.treatmentsDialog.current?.visible)
        .toBe(false);

    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      treatmentRef.current.edit(1, {
        type: TreatmentType.Performed,
        message: 'dummy'})
      ;
      expect(onError).toBeCalled();
    });
    await waitFor(()=> {
      expect(screen.getByText('Async error message')).toBeInTheDocument();
    });
  });
  test('remove calls delete', async () => {
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    mockedAxios.delete.mockResolvedValue({data: []});
    const treatmentRef = createRef<TreatmentRef>();
    const onAccessibleChange=jest.fn();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
          onAccessibleChange={onAccessibleChange}
        />,
    );
    if (!treatmentRef.current) {
      fail('treatmentRef ref should be available by now');
    }
    expect(treatmentRef.current.confirmDialog.current?.visible)
        .toBe(false);

    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      treatmentRef.current.remove(1);
    });
    await waitFor(()=>expect(onAccessibleChange).toBeCalled());
    expect(mockedAxios.delete).toBeCalledWith(
        expect.stringMatching('/foo'),
        expect.objectContaining(
            {data: {'id': 1}},
        ),
    );
  });
  test('openRemoveDialog opens confirm', async () => {
    const treatmentRef = createRef<TreatmentRef>();
    render(
        <Treatment
          ref={treatmentRef}
          apiUrl='/foo'
          apiData={sampleData}
        />,
    );
    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      expect(
          treatmentRef.current.confirmDialog.current?.visible,
      ).toBe(false);
      treatmentRef.current.openConfirmDialog(1, TreatmentType.Performed);
    });
    await waitFor(()=>{
      if (!treatmentRef.current) {
        fail('treatmentRef ref should be available by now');
      }
      expect(treatmentRef.current.confirmDialog.current?.visible).toBe(true);
    });
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
