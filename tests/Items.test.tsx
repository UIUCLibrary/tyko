/**
 * @jest-environment jsdom
 */

'use strict';
import axios from 'axios';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import {
  render,
  waitFor,
  fireEvent,
  screen,
  getByRole,
  waitForElementToBeRemoved, getByLabelText,
} from '@testing-library/react';
import Items, {
  CassetteOnlyData,
  FormatSpecificFields,
  NewItemButton,
  NewItemModal,
  ObjectItemsApp,
  FilmOnlyData,
  GrooveDiscOnlyData,
  OpenReelOnlyData,
  OpticalOnlyData,
  VideoOnlyData,
} from '../tyko/static/js/reactComponents/Items';
import React from 'react';

jest.mock('vanillajs-datepicker', ()=> {});

describe('Items', ()=>{
  const onRemoval = (url: string) => {

  };
  test('include name', ()=>{
    const items = [
      {
        files: [],
        format: {
          id: 1,
          name: 'audio cassette',
        },
        elements: [],
        format_details: {},
        format_id: 1,
        item_id: 1,
        name: 'bar',
        routes: {
          api: '/api/bar',
          frontend: '/bar',
        },
      },
    ];
    const {getByText} = render(
        <table>
          <tbody>
            <Items items={items} onRemoval={onRemoval}/>
          </tbody>
        </table>);
    expect(getByText('bar')).toBeInTheDocument();
  });
});
describe('NewItemModal', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/format') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo format',
                },
                {
                  id: 2,
                  name: 'bar format',
                },
              ],
            },
        );
      }
      return Promise.resolve({});
    });
    axios.post = jest.fn((url: string): Promise<any> => {
      return Promise.resolve();
    });
  });
  test('has Select a Format', async ()=>{
    const {getByText} = render(<NewItemModal show={true}/>);
    await waitFor(()=> {
      expect(getByText(/Select a Format/)).toBeInTheDocument();
    });
  });
  test('selection', async ()=>{
    const {getByText, getByLabelText} = render(<NewItemModal show={true}/>);
    await waitFor(()=> {
      userEvent.selectOptions(getByLabelText('Format'), '2');
      expect(
          (getByText('bar format') as HTMLOptionElement).selected,
      ).toBeTruthy();
    });
  });
});
describe('FormatSpecificFields', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/audio_cassette/generation') {
        return Promise.resolve({data: [
          {
            id: 1,
            name: 'foo',
          },
          {
            id: 2,
            name: 'bar',
          },
        ]});
      }
      if (url === '/api/formats/audio_cassette/subtype') {
        return Promise.resolve({data: [
          {
            id: 2,
            name: 'bar',
          },
          {
            id: 3,
            name: 'baz',
          },
        ]});
      }
      return Promise.resolve({data: []});
    });
  });
  describe('audio cassette', ()=>{
    test('Title of Cassette', async ()=>{
      const type = {
        id: 1,
        name: 'audio cassette',
      };
      const {getByText} = render(<FormatSpecificFields type={type}/>);
      await waitFor(()=>{
        expect(getByText('Title of Cassette')).toBeInTheDocument();
      });
    });
  });
});
describe('CassetteOnlyData', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/audio_cassette/generation') {
        return Promise.resolve({data: [
          {
            id: 1,
            name: 'foo generation',
          },
          {
            id: 2,
            name: 'bar',
          },
        ]});
      }
      if (url === '/api/formats/audio_cassette/subtype') {
        return Promise.resolve({data: [
          {
            id: 2,
            name: 'bar sub type',
          },
          {
            id: 3,
            name: 'baz',
          },
        ]});
      }
      return Promise.resolve({data: []});
    });
  });
  test('Title of Cassette', async ()=>{
    const {getByText} = render(<CassetteOnlyData/>);
    await waitFor(()=>{
      expect(getByText('Title of Cassette')).toBeInTheDocument();
    });
  });
  describe('enum fields loaded', ()=>{
    test.each([
      ['foo generation', 'generation'],
      ['bar sub type', 'subtype'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<CassetteOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});
describe('NewItemButton', ()=>{
  test('click calls show', async ()=>{
    const onShow = jest.fn();
    const {getByTestId} = render(<NewItemButton onShow={onShow}/>);
    await waitFor(()=> {
      const button = getByTestId('addButton');
      fireEvent.click(button);
      expect(onShow).toBeCalled();
    });
  });
});
describe('ObjectItemsApp', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/format') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo format',
                },
                {
                  id: 2,
                  name: 'audio cassette',
                },
              ],
            },
        );
      }
      if (url === '/api') {
        return Promise.resolve({data: [
          {
            endpoint: 'api.project_object',
            methods: [
              'DELETE',
              'HEAD',
              'GET',
              'OPTIONS',
            ],
            route: '/api/project/<int:project_id>/object/<int:object_id>',
          },
        ]});
      }
      if (url === '/api/project/2/object/1') {
        return Promise.resolve({
          data: {
            'items': [
              {
                name: 'sss',
                item_id: 1,
                routes: {
                  api: '/api/project/2/object/1/item?item_id=1',
                  frontend: '/project/2/object/1/item/1',
                },
                format: {
                  id: 7,
                  name: 'audio cassette',
                },
              },
            ],
            'routes': {
              api: '/api/project/2/object/1',
              frontend: '/project/2/object/1',
            },
          },
        });
      }
      return Promise.resolve({data: []});
    });
  });

  test('Format label', async ()=>{
    const {getByText} =
      render(
          <ObjectItemsApp
            apiUrl='/api'
            objectId={1}
            projectId={2}
            newItemSubmitUrl='/submitme'
          />);
    await waitFor(()=>{
      const formatLabel = getByText('Format');
      expect(formatLabel).toBeInTheDocument();
    });
  });
  test('add item', async ()=>{
    axios.post = jest.fn((url: string): Promise<any> => {
      return Promise.resolve({data: []});
    });
    const {getByText, getByTestId, getByLabelText, getByTitle} = render(
        <ObjectItemsApp
          apiUrl='/api'
          objectId={1}
          projectId={2}
          newItemSubmitUrl='/submitme'
        />);
    await waitFor(async ()=> {
      return await waitForElementToBeRemoved(()=>getByText('Loading...'));
    });
    await waitFor(()=> getByText('Format'));
    await waitFor(()=>{
      fireEvent.click(getByTestId('addButton'));
    });
    const form = getByTitle('newItem');
    await waitFor(()=> {
      userEvent.selectOptions(getByLabelText('Format'), '2');
      fireEvent.submit(form);
    });
    await waitFor(()=>{
      expect(axios.post).toBeCalled();
    });
  });
  test('add item with barcode', async ()=>{
    axios.post = jest.fn((url: string): Promise<any> => {
      return Promise.resolve({data: []});
    });
    render(
        <ObjectItemsApp
          apiUrl='/api'
          objectId={1}
          projectId={2}
          newItemSubmitUrl='/submitme'
        />);
    await waitFor(async ()=> {
      return await waitForElementToBeRemoved(
          ()=>screen.getByText('Loading...')
      );
    });
    await waitFor(()=> screen.getByText('Format'));
    await waitFor(()=>{
      fireEvent.click(screen.getByTestId('addButton'));
    });
    const form = screen.getByTitle('newItem');
    await waitFor(async ()=> {
      await userEvent.selectOptions(screen.getByLabelText('Format'), '2');
      fireEvent.change(
          screen.getByLabelText('Barcode'),
          {
            target: {
              value: '12345',
            },
          }
      );
      fireEvent.submit(form);
    });
    await waitFor(()=>{
      expect(axios.post).toHaveBeenCalledWith(
          '/submitme',
          {
            'cassetteTitle': '',
            'cassetteTypeId': '',
            'inspectionDate': '',
            'generationId': '',
            'transferDate': '',
            'dateOfCassette': '',
            'cassetteSideALabel': '',
            'cassetteSideADuration': '',
            'cassetteSideBLabel': '',
            'cassetteSideBDuration': '',
            'format_id': '2',
            'itemBarcode': '12345',
            'name': '',
          }, {
            'headers': {
              'Content-Type': 'multipart/form-data',
            },
          });
    });
  });
  test('delete item', async ()=>{
    axios.delete = jest.fn((url: string): Promise<any> => {
      return Promise.resolve({data: []});
    });
    const {getByText, getByRole} = await waitFor(()=>{
      return render(
          <ObjectItemsApp
            apiUrl='/api'
            objectId={1}
            projectId={2}
            newItemSubmitUrl='/submitme'
          />);
    });

    await waitFor(()=> {
      return waitForElementToBeRemoved(()=>getByText('Loading...'));
    });

    await waitFor(()=> getByText('Format'));

    await waitFor(()=> fireEvent.click(getByText('Remove')));
    await waitFor(()=> getByRole('dialog'));
    await waitFor(()=> fireEvent.click(getByText('Remove Item')));
    await waitFor(()=>{
      expect(axios.delete).toBeCalled();
    });
  });
});

describe('film only data', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/film/film_speed') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo speed',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/film/film_base') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo base',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/film/image_type') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo image type',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/film/soundtrack') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo soundtrack',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/film/color') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo color',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/film/wind') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo wind',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/film/film_emulsion') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo film emulsion',
                },
              ],
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('Speed', async ()=>{
    const {getByText} = await waitFor(()=>{
      return render(<FilmOnlyData/>);
    });
    const speed = await waitFor(()=> {
      return getByText('Speed (fps)');
    });
    expect(speed).toBeInTheDocument();
  });
  describe('enum fields loaded', ()=>{
    test.each([
      ['foo speed', 'filmSpeed'],
      ['foo base', 'base'],
      ['foo image type', 'imageType'],
      ['foo soundtrack', 'soundtrack'],
      ['foo color', 'color'],
      ['foo wind', 'wind'],
      ['foo film emulsion', 'filmEmulsion'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<FilmOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});


describe('GrooveDisc data', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/grooved_disc/disc_base') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo base',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/grooved_disc/disc_material') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo material',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/grooved_disc/disc_diameter') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo diameter',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/grooved_disc/playback_direction') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo playback direction',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/grooved_disc/playback_speed') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo speed',
                },
              ],
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('Title of Album', async ()=>{
    const {getByText} = await waitFor(()=>{
      return render(<GrooveDiscOnlyData/>);
    });
    const speed = await waitFor(()=> {
      return getByText('Title of Album');
    });
    expect(speed).toBeInTheDocument();
  });
  describe('enum fields loaded', ()=>{
    test.each([
      ['foo base', 'base'],
      ['foo material', 'material'],
      ['foo diameter', 'discDiameter'],
      ['foo playback direction', 'playbackDirection'],
      ['foo speed', 'playbackSpeed'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<GrooveDiscOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});
describe('OpenReel Data', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/open_reel/base') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo base',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/generation') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo generation',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/reel_diameter') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo diameter',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/reel_speed') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo reel speed',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/reel_thickness') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo reel thickness',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/reel_width') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo reel width',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/sub_types') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo sub types',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/track_configuration') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo track configuration',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/open_reel/wind') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo wind',
                },
              ],
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('Title of Reel', async ()=>{
    const {getByText} = await waitFor(()=>{
      return render(<OpenReelOnlyData/>);
    });
    const element = await waitFor(()=> {
      return getByText('Title of Reel');
    });
    expect(element).toBeInTheDocument();
  });
  describe('enum fields loaded', ()=>{
    test.each([
      ['foo base', 'base'],
      ['foo generation', 'generation'],
      ['foo diameter', 'reelDiameter'],
      ['foo reel speed', 'reelSpeed'],
      ['foo reel thickness', 'reelThickness'],
      ['foo reel width', 'reelWidth'],
      ['foo sub types', 'subtypes'],
      ['foo track configuration', 'trackConfiguration'],
      ['foo wind', 'wind'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<OpenReelOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});


describe('Cassette only data', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/audio_cassette/generation') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo generation',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/audio_cassette/subtype') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo sub type',
                },
              ],
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('Side A', async ()=>{
    const {getByText} = await waitFor(()=>{
      return render(<CassetteOnlyData/>);
    });
    const speed = await waitFor(()=> {
      return getByText('Side A');
    });
    expect(speed).toBeInTheDocument();
  });
  describe('enum fields loaded', ()=>{
    test.each([
      ['foo sub type', 'subtype'],
      ['foo generation', 'generation'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<CassetteOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});


describe('Optical only data', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/optical/optical_types') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo sub tyoe',
                },
              ],
            },
        );
      }
      return Promise.resolve();
    });
  });
  test('Optical Type', async ()=>{
    const {getByText} = await waitFor(()=>{
      return render(<OpticalOnlyData/>);
    });
    const speed = await waitFor(()=> {
      return getByText('Optical Type');
    });
    expect(speed).toBeInTheDocument();
  });

  describe('enum fields loaded', ()=>{
    test.each([
      ['foo sub tyoe', 'type'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<OpticalOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});


describe('video cassette only data', ()=>{
  beforeEach(()=>{
    axios.get = jest.fn((url: string): Promise<any> => {
      if (url === '/api/formats/video_cassette/cassette_types') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo sub tyoe',
                },
              ],
            },
        );
      }
      if (url === '/api/formats/video_cassette/generations') {
        return Promise.resolve(
            {
              data: [
                {
                  id: 1,
                  name: 'foo generation',
                },
              ],
            },
        );
      }
      return Promise.resolve();
    });
  });

  test('Title of Cassette', async ()=>{
    const {getByText} = await waitFor(()=>{
      return render(<VideoOnlyData/>);
    });
    const title = await waitFor(()=> {
      return getByText('Title of Cassette');
    });
    expect(title).toBeInTheDocument();
  });
  describe('enum fields loaded', ()=>{
    test.each([
      ['foo sub tyoe', 'type'],
      ['foo generation', 'generation'],
    ])('%p in %p', async (enumValue: string, label: string)=>{
      const {getByText, getByLabelText} = await waitFor(()=>{
        return render(<VideoOnlyData/>);
      });
      const value = await waitFor(()=> {
        return getByText(enumValue);
      });
      expect(getByLabelText(label)).toContainElement(value);
    });
  });
});
