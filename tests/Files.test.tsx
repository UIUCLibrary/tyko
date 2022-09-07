/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {Files} from '../tyko/static/js/reactComponents/Files';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import axios from 'axios';

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
  test('add', async ()=>{
    const onAccessibleChange = jest.fn();
    render(<Files apiUrl='/foo' onAccessibleChange={onAccessibleChange}/>);
    fireEvent.click(screen.getByText('Edit'));
    fireEvent.click(screen.getByText('Add'));
    fireEvent.change(
        screen.getByLabelText('File Name'),
        {target: {value: '123123'}},
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
