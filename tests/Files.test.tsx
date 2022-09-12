/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {
  FileGeneration, FileRef,
  Files,
  FilesDialog,
  FilesDialogRef,
} from '../tyko/static/js/reactComponents/Files';
import {within} from '@testing-library/dom';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import axios from 'axios';
import {IItemMetadata} from 'ItemApp';
import {createRef} from 'react';

jest.mock('axios');

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
  describe('optionsMenu', ()=>{
    const itemMetadata: IItemMetadata = {
      barcode: null,
      format_details: {},
      format_id: 0,
      item_id: 0,
      name: '',
      notes: [],
      obj_sequence: 0,
      parent_object_id: 0,
      treatment: [],
      files: [
        {
          generation: 'foo',
          id: 1,
          name: 'bar',
          routes: {
            api: '/api/baz',
            frontend: '/baz',
          },
        },
      ],
      format: {
        id: 1,
        name: 'foo',
      },
    };
    afterEach(() => {
      jest.clearAllMocks();
    });
    test('Edit dialog box open', async ()=>{
      const filesRef = createRef<FileRef>();
      render(
          <Files
            ref={filesRef}
            apiUrl='/foo'
            apiData={itemMetadata}
          />,
      );
      fireEvent.click(screen.getByText('Edit'));
      const row = screen.getByRole(
          'cell', {name: 'bar'},
      ).closest('tr') as HTMLTableRowElement;
      const optionsMenu = within(row).getByRole('optionsMenu');
      fireEvent.click(within(optionsMenu).getByRole('button'));
      fireEvent.click(within(optionsMenu).getByText('Edit'));
      await waitFor(()=>{
        expect(filesRef.current?.forwardingUrl).toBe('/baz');
      });
    });
    test('remove', async ()=>{
      const onAccessibleChange = jest.fn();
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      mockedAxios.delete.mockResolvedValueOnce({});
      const onUpdated = jest.fn();
      render(
          <Files
            apiUrl='/foo'
            onAccessibleChange={onAccessibleChange}
            onUpdated={onUpdated}
            apiData={itemMetadata}
          />,
      );
      fireEvent.click(screen.getByText('Edit'));
      const row = screen.getByRole(
          'cell', {name: 'bar'},
      ).closest('tr') as HTMLTableRowElement;

      fireEvent.click(
          within(within(row).getByRole('optionsMenu')).getByRole('button'),
      );
      fireEvent.click(within(row).getByText('Remove'));
      fireEvent.click(within(screen.getByRole('dialog')).getByText('Remove'));
      await waitFor(()=> {
        expect(mockedAxios.delete)
            .toBeCalledWith('/foo?id=1', {'data': {'id': 1}});
      });
      await waitFor(onUpdated);
    });
    test('remove cancelled', async ()=>{
      const onAccessibleChange = jest.fn();
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      mockedAxios.delete.mockResolvedValueOnce({});
      const onUpdated = jest.fn();
      render(
          <Files
            apiUrl='/foo'
            onAccessibleChange={onAccessibleChange}
            onUpdated={onUpdated}
            apiData={itemMetadata}
          />,
      );
      fireEvent.click(screen.getByText('Edit'));
      const row = screen.getByRole(
          'cell', {name: 'bar'},
      ).closest('tr') as HTMLTableRowElement;

      fireEvent.click(
          within(within(row).getByRole('optionsMenu')).getByRole('button'),
      );
      fireEvent.click(within(row).getByText('Remove'));
      fireEvent.click(within(screen.getByRole('dialog')).getByText('Cancel'));
      await waitFor(()=> {
        expect(mockedAxios.delete).not.toBeCalled();
      });
    });
    test('add', async ()=>{
      const onAccessibleChange = jest.fn();
      render(<Files apiUrl='/foo' onAccessibleChange={onAccessibleChange}/>);
      fireEvent.click(screen.getByText('Edit'));
      fireEvent.click(screen.getByText('Add'));
      fireEvent.change(
          screen.getByLabelText('File Name'),
          {target: {value: '123123'}},
      );
      fireEvent.change(
          screen.getByLabelText('Generation'),
          {target: {value: 'Access'}},
      );
      const mockedAxios = axios as jest.Mocked<typeof axios>;
      mockedAxios.post.mockResolvedValue({data: []});
      fireEvent.click(screen.getByText('Save'));
      await waitFor(()=>{
        expect(mockedAxios.post)
            .toBeCalledWith(
                '/foo',
                {
                  'file_name': '123123',
                  'generation': 'Access',
                },
            );
      });
      await waitFor(()=>expect(onAccessibleChange).toBeCalled());
    });
  });
});

describe('FilesDialog', ()=>{
  describe('use ref', ()=>{
    test('set file name', async ()=>{
      const dialogRef = createRef<FilesDialogRef>();
      const onAccepted = jest.fn();
      render(<FilesDialog ref={dialogRef} onAccepted={onAccepted}/>);
      expect(dialogRef.current).not.toBe(null);
      const dialog = dialogRef.current as FilesDialogRef;
      await waitFor(()=> {
        dialog.setFileName('foo.txt');
        dialog.setGeneration(FileGeneration.Preservation);
        dialog.setShow(true);
        expect(screen.getByLabelText('File Name')).toHaveValue('foo.txt');
      });
      const dialogElement = screen.getByRole('dialog');
      await waitFor(()=>{
        dialog.accept();
        expect(dialogElement).not.toBeVisible();
      });
      expect(onAccepted)
          .toBeCalledWith({fileName: 'foo.txt', generation: 'Preservation'});
    });
  });
});
