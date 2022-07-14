/**
 * @jest-environment jsdom
 */
'use strict';
import '@testing-library/jest-dom';
import {
  render,
  screen,
} from '@testing-library/react';

import Welcome from '../tyko/static/js/pages/Welcome';

describe('Welcome', () => {
  test('includes software title', ()=>{
    render(<Welcome/>);
    expect(screen.getByText('Tyko')).toBeInTheDocument();
  });
});

