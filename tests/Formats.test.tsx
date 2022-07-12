/*
 * @jest-environment jsdom
 */
'use strict';
import '@testing-library/jest-dom';
import Formats from '../tyko/static/js/pages/Formats';

import {
  render,
  screen,
} from '@testing-library/react';

describe('Formats', ()=>{
  test('Formats heading', ()=>{
    render(<Formats/>);
    expect(screen.getByText('Formats')).toBeInTheDocument();
  });
});
