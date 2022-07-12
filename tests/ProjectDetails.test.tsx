/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import {render, waitFor, screen} from '@testing-library/react';
import ProjectDetails from '../tyko/static/js/pages/ProjectDetails';
jest.mock('vanillajs-datepicker', ()=>{});

describe('ProjectDetails', () => {
  test('Details exists',() => {
    render(<ProjectDetails/>);
    expect(screen.getByText('Details')).toBeInTheDocument();
  });
});
