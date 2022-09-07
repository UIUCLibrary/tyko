/**
 * @jest-environment jsdom
 */

'use strict';
import '@testing-library/jest-dom';
import {Files} from '../tyko/static/js/reactComponents/Files';
import {render, screen} from '@testing-library/react';

describe('Files', ()=> {
  test('Edit button', ()=>{
    render(<Files apiUrl='/foo'/>);
    expect(screen.getByText('Edit')).toBeVisible();
  });
});
