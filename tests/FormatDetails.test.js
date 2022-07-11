/**
 * @jest-environment jsdom
 */
import axios from 'axios';
import React from 'react';
import '@testing-library/jest-dom';

import {
  fireEvent,
  getByDisplayValue,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import FormatDetails from '../tyko/static/js/reactComponents/FormatDetails';

jest.mock('vanillajs-datepicker', ()=>{});
const mockResponseAudioCassette = {
  files: [],
  format: {
    id: 7,
    name: 'audio cassette',
  },
  format_details: {
    cassette_title: 'my cassette title',
    cassette_type: {
      id: 5,
      name: 'DAT',
    },
    date_of_cassette: '5/16/2022',
    generation: null,
    side_a_duration: null,
    side_a_label: null,
    side_b_duration: null,
    side_b_label: null,
  },
  format_id: 7,
  inspection_date: null,
  item_id: 1,
  name: 'Audio Cassette object',
  notes: [],
  obj_sequence: null,
  parent_object_id: 1,
  transfer_date: null,
};
// beforeEach(() => {
//   axios.get = jest.fn(() => {
//     Promise.resolve({data: {data: mockResponseAudioCassette}});
//   });
// });

// afterEach(cleanup);
describe('FormatDetails', ()=> {
  const mockEnums = {
    '/api/formats/grooved_disc/disc_base': [
      {
        'id': 1,
        'name': 'Glass',
      },
      {
        'id': 2,
        'name': 'Cardboard',
      },
      {
        'id': 3,
        'name': 'Aluminum',
      },
      {
        'id': 4,
        'name': 'Unknown',
      },
    ],
    '/api/formats/grooved_disc/playback_speed': [
      {
        'id': 1,
        'name': '33 1/3',
      },
      {
        'id': 2,
        'name': '45',
      },
      {
        'id': 3,
        'name': '78',
      },
    ],
    '/api/formats/grooved_disc/disc_material': [
      {
        'id': 1,
        'name': 'Shellac/78',
      },
      {
        'id': 2,
        'name': 'Lacquer',
      },
      {
        'id': 3,
        'name': 'Vinyl',
      },
      {
        'id': 4,
        'name': 'Edison Diamond',
      },
    ],
    '/api/formats/grooved_disc/playback_direction': [
      {
        'id': 1,
        'name': 'In to Out',
      },
      {
        'id': 2,
        'name': 'Out to In',
      },
    ],
    '/api/formats/open_reel/base': [],
    '/api/formats/open_reel/reel_diameter': [],
    '/api/formats/open_reel/sub_types': [],
    '/api/formats/open_reel/reel_speed': [],
    '/api/formats/open_reel/generation': [],
    '/api/formats/open_reel/reel_thickness': [],
    '/api/formats/open_reel/reel_width': [],
    '/api/formats/open_reel/track_configuration': [],
    '/api/formats/open_reel/wind': [],
    '/api/formats/film/film_base': [],
    '/api/formats/film/film_speed': [],
    '/api/formats/film/image_type': [],
    '/api/formats/film/color': [],
    '/api/formats/film/wind': [],
    '/api/formats/film/film_emulsion': [],
    '/api/formats/film/film_gauge': [],
    '/api/formats/film/soundtrack': [],
    '/api/formats/audio_cassette/generation': [],
    '/api/formats/audio_cassette/subtype': [],
    '/api/formats/video_cassette/generations': [],
    '/api/formats/video_cassette/cassette_type': [],
    '/api/formats/grooved_disc/disc_diameter': [
      {
        'id': 1,
        'name': '7',
      },
      {
        'id': 2,
        'name': '8',
      },
      {
        'id': 3,
        'name': '10',
      },
      {
        'id': 4,
        'name': '12',
      },
      {
        'id': 5,
        'name': '16',
      },
    ],
  };
  beforeEach(() => {
    axios.get = jest.fn((url) => {
      return Promise.resolve({data: mockEnums[url]});
    });
  });
  describe('items', () => {
    const cases = [
      [
        {
          format_details: {
            date_of_cassette: null,
            duration: null,
            title_of_cassette: 'foo',
            generation: null,
            cassette_type: null,
            label: null,
          },
          format: {
            id: 9,
            name: 'video cassette',
          },
          format_id: 9,
        },
        'foo',
      ],
      [
        {
          format_details: {
            cassette_title: 'foo',
            cassette_type: null,
            date_of_cassette: null,
            generation: null,
            side_a_duration: null,
            side_a_label: null,
            side_b_duration: null,
            side_b_label: null,
          },
          format: {
            id: 7,
            name: 'audio cassette',
          },
          format_id: 7,
        },
        'foo',
      ],
      [
        {
          format_details: {
            ad_strip_test: null,
            ad_test_date: null,
            ad_test_level: null,
            can_label: 'foo',
            date_of_film: null,
            duration: null,
            film_title: null,
            leader_label: null,
            edge_code_date: null,
            film_length: null,
            film_shrinkage: null,
            film_gauge: null,
            film_base: null,
            film_emulsion: null,
            film_image_type: null,
            film_speed: null,
            soundtrack: null,
            wind: null,
            color: null,
          },
          format: {
            id: 6,
            name: 'film',
          },
          format_id: 6,
        },
        'foo',
      ],
      [
        {
          format_details: {
            title_of_reel: 'foo',
            track_count: 1,
            base: null,
            date_of_reel: '2/20/1986',
            duration: '00:01:24',
            format_subtype: null,
            generation: null,
            reel_brand: null,
            reel_diameter: null,
            reel_speed: null,
            reel_thickness: null,
            reel_type: null,
            reel_width: null,
            track_configuration: null,
            wind: null,
          },
          format: {
            id: 4,
            name: 'open reel',
          },
          format_id: 4,
        },
        'foo',
      ],
      [
        {
          format_details: {
            title_of_album: '',
            title_of_disc: 'foo',
            disc_base: null,
            date_of_disc: null,
            disc_diameter: null,
            playback_direction: null,
            disc_material: null,
            playback_speed: null,
            side_a_label: null,
            side_a_duration: null,
            side_b_label: null,
            side_b_duration: null,
          },
          format: {
            id: 5,
            name: 'grooved disc',
          },
          format_id: 5,
        },
        'foo',
      ],
    ];
    test.each(cases)('edit %p', async (metadata, expectedValue) => {
      render(
          <FormatDetails apiData={metadata} apiUrl='/foo'/>,
      );
      expect(
          screen.getByDisplayValue(expectedValue),
      ).toHaveAttribute('readonly');
      await waitFor(() => {
        fireEvent.click(screen.getByText('Edit'));
        return waitForElementToBeRemoved(() => screen.getByRole('progressbar'));
      });
      expect(
          screen.getByDisplayValue(expectedValue),
      ).not.toHaveAttribute('readonly');
    });
  });
});
describe('video cassette', ()=>{
  test('video cassette', async ()=>{
    const mockResponseVideoCassette = {
      format_details: {
        date_of_cassette: '',
        title_of_cassette: 'foo',
        duration: '',
        label: '',
        generation: null,
        cassette_type: null,
      },
      format: {
        id: 9,
        name: 'video cassette',
      },
      format_id: 9,
    };
    await waitFor(()=>{
      return render(
          <FormatDetails apiData={mockResponseVideoCassette} apiUrl='/foo'/>,
      );
    });
    await waitFor(()=>{
      return screen.getByText('Edit').click();
    });

    expect(screen.getByDisplayValue('foo')).toBeInTheDocument();
  });
});

describe('FormatDetails', ()=>{
  it('data is loaded into the document', ()=> {
    const {getByDisplayValue} = render(
        <FormatDetails apiData={mockResponseAudioCassette} apiUrl='/foo'/>,
    );
    expect(getByDisplayValue('my cassette title')).toBeInTheDocument();
  });
  it('test unsupported format', ()=>{
    const mockData = {
      files: [],
      format: {
        id: -1,
        name: 'some new format',
      },
      format_details: {
        foo: 'Foo',
      },
      format_id: -1,
      inspection_date: null,
      item_id: 1,
      name: 'some new format item',
      notes: [],
      obj_sequence: null,
      parent_object_id: 1,
      transfer_date: null,
    };
    const {getByText} =
      render(<FormatDetails apiData={mockData} apiUrl='/foo'/>);

    expect(getByText('Foo')).toBeInTheDocument();
  });
  it.each([
    [
      'AudioCassette',
      {
        files: [],
        format: {
          id: 7,
          name: 'audio cassette',
        },
        format_details: {
          cassette_title: 'my cassette title',
          cassette_type: null,
          date_of_cassette: '5/16/2022',
          generation: null,
          side_a_duration: null,
          side_a_label: null,
          side_b_duration: null,
          side_b_label: null,
        },
        format_id: 7,
        inspection_date: null,
        item_id: 1,
        name: 'Audio Cassette object',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: null,
      },
      'my cassette title',
    ],
    [
      'AudioCassette - minimum',
      {
        files: [],
        format: {
          id: 7,
          name: 'audio cassette',
        },
        format_details: {
          cassette_title: 'my minimal cassette title',
          cassette_type: null,
          date_of_cassette: null,
          generation: null,
          side_a_duration: null,
          side_a_label: null,
          side_b_duration: null,
          side_b_label: null,
        },
        format_id: 7,
        inspection_date: null,
        item_id: 1,
        name: 'Audio Cassette object',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: null,
      },
      'my minimal cassette title',
    ],
    [
      'AudioCassette all metadata',
      {
        files: [],
        format: {
          id: 7,
          name: 'audio cassette',
        },
        format_details: {
          cassette_title: 'my cassette title',
          cassette_type: {
            id: 5,
            name: 'DAT',
          },
          date_of_cassette: '5/16/2022',
          generation: {
            'id': 1,
            'name': 'foo',
          },
          side_a_duration: '01:13:00',
          side_a_label: 'my side a label',
          side_b_duration: '01:13:00',
          side_b_label: 'my side b label',
        },
        format_id: 7,
        inspection_date: null,
        item_id: 1,
        name: 'Audio Cassette object',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: null,
      },
      'my cassette title',
    ],
    [
      'OpenReel', {
        files: [],
        format: {
          id: 4,
          name: 'open reel',
        },
        format_details: {
          base: null,
          date_of_reel: '6/16/2022',
          duration: '01:23:33',
          format_subtype: null,
          generation: null,
          reel_brand: 'some brand',
          reel_diameter: null,
          reel_size: 7,
          reel_speed: null,
          reel_thickness: null,
          reel_type: 'plastic',
          reel_width: null,
          title_of_reel: null,
          track_configuration: null,
          track_count: 2,
          wind: null,
        },
        format_id: 4,
        inspection_date: '6/24/2022',
        item_id: 4,
        name: 'Op reel name',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '6/11/2022',
      },
      'Title of Reel',
    ],
    [
      'OpenReel minimal', {
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
          title_of_reel: 'Op reel name',
          track_configuration: null,
          track_count: null,
          wind: null,
        },
        format_id: 4,
        inspection_date: '6/24/2022',
        item_id: 4,
        name: 'Op reel name',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '6/11/2022',
      },
      'Op reel name',
    ],
    [
      'Open reel all metadata',
      {
        files: [],
        format: {
          id: 4,
          name: 'open reel',
        },
        format_details: {
          base: {
            'id': 2,
            'name': 'foo',
          },
          date_of_reel: '12/10/2000',
          duration: '01:12:00',
          title_of_reel: 'my reel',
          format_subtype: {
            'id': 1,
            'name': 'foo',
          },
          generation: {
            'id': 1,
            'name': 'bar',
          },
          reel_brand: 'some brand',
          reel_speed: {
            'id': 1,
            'name': 'baz',
          },
          reel_diameter: {
            'id': 1,
            'name': 'baz',
          },
          reel_thickness: {
            'id': 1,
            'name': 'qux',
          },
          reel_size: 16,
          reel_type: 'plastic',
          reel_width: {
            'id': 1,
            'name': 'quux',
          },
          track_configuration: {
            'id': 1,
            'name': 'quuz',
          },
          track_count: 2,
          wind: {
            'id': 1,
            'name': 'core',
          },
        },
      },
      'my reel',
    ],
    [
      'VideoCassette',
      {
        files: [],
        format: {
          id: 9,
          name: 'video cassette',
        },
        format_details: {
          cassette_type: null,
          date_of_cassette: '1/2/2000',
          duration: '20:30:30',
          generation: null,
          label: 'Label title',
          title_of_cassette: 'Title of cassette',
        },
        format_id: 9,
        inspection_date: '2/1/2000',
        item_id: 8,
        name: 'My video cassette item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '3/2/2000',
      },
      'Title of cassette',
    ],
    [
      'VideoCassette - minimal',
      {
        files: [],
        format: {
          id: 9,
          name: 'video cassette',
        },
        format_details: {
          cassette_type: null,
          date_of_cassette: null,
          duration: null,
          generation: null,
          label: null,
          title_of_cassette: 'Title of cassette minimum',
        },
        format_id: 9,
        inspection_date: '2/1/2000',
        item_id: 8,
        name: 'My video cassette item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '3/2/2000',
      },
      'Title of cassette minimum',
    ],
    [
      'VideoCassette all metadata',
      {
        files: [],
        format: {
          id: 9,
          name: 'video cassette',
        },
        format_details: {
          cassette_type: {
            'id': 1,
            'name': 'bar',
          },
          date_of_cassette: '1/2/2000',
          duration: '20:30:30',
          generation: {
            'id': 1,
            'name': 'foo',
          },
          label: 'Label title',
          title_of_cassette: 'Title of cassette',
        },
        format_id: 9,
        inspection_date: '2/1/2000',
        item_id: 8,
        name: 'My video cassette item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '3/2/2000',
      },
      'Title of cassette',
    ],
    [
      'Film',
      {
        files: [],
        format: {
          id: 6,
          name: 'film',
        },
        format_details: {
          ad_strip_test: null,
          ad_test_date: null,
          ad_test_level: null,
          can_label: 'Can label',
          color: null,
          date_of_film: '6/10/2022',
          duration: '01:16:52',
          edge_code_date: 2022,
          film_base: null,
          film_emulsion: null,
          film_gauge: null,
          film_image_type: null,
          film_length: 144,
          film_shrinkage: 32,
          film_speed: null,
          film_title: 'Title of film',
          leader_label: 'Leader Labe',
          soundtrack: null,
          wind: null,
        },
        format_id: 6,
        inspection_date: '5/25/2022',
        item_id: 6,
        name: 'Film Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '7/2/2022',
      },
      'Film Shrinkage',
    ],
    [
      'Film - minimum',
      {
        files: [],
        format: {
          id: 6,
          name: 'film',
        },
        format_details: {
          ad_strip_test: null,
          ad_test_date: null,
          ad_test_level: null,
          can_label: null,
          color: null,
          date_of_film: null,
          duration: null,
          edge_code_date: null,
          film_base: null,
          film_emulsion: null,
          film_gauge: null,
          film_image_type: null,
          film_length: null,
          film_shrinkage: null,
          film_speed: null,
          film_title: 'Title of film minimal',
          leader_label: null,
          soundtrack: null,
          wind: null,
        },
        format_id: 6,
        inspection_date: '5/25/2022',
        item_id: 6,
        name: 'Film Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '7/2/2022',
      },
      'Title of film minimal',
    ],
    [
      'Film no ad strip',
      {
        files: [],
        format: {
          id: 6,
          name: 'film',
        },
        format_details: {
          ad_strip_test: false,
          ad_test_date: null,
          ad_test_level: null,
          can_label: 'Can label',
          color: null,
          date_of_film: '6/10/2022',
          duration: '01:16:52',
          edge_code_date: 2022,
          film_base: null,
          film_emulsion: null,
          film_gauge: null,
          film_image_type: null,
          film_length: 144,
          film_shrinkage: 32,
          film_speed: null,
          film_title: 'Title of film',
          leader_label: 'Leader Labe',
          soundtrack: null,
          wind: null,
        },
        format_id: 6,
        inspection_date: '5/25/2022',
        item_id: 6,
        name: 'Film Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '7/2/2022',
      },
      'No',
    ],
    [
      'Film ad strip performed',
      {
        files: [],
        format: {
          id: 6,
          name: 'film',
        },
        format_details: {
          ad_strip_test: true,
          ad_test_date: '6/6/2001',
          ad_test_level: '2',
          can_label: 'Can label',
          color: null,
          date_of_film: '6/10/2022',
          duration: '01:16:52',
          edge_code_date: 2022,
          film_base: null,
          film_emulsion: null,
          film_gauge: null,
          film_image_type: null,
          film_length: 144,
          film_shrinkage: 32,
          film_speed: null,
          film_title: 'Title of film',
          leader_label: 'Leader Labe',
          soundtrack: null,
          wind: null,
        },
        format_id: 6,
        inspection_date: '5/25/2022',
        item_id: 6,
        name: 'Film Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '7/2/2022',
      },
      'Yes',
    ],
    [
      'Film all metadata',
      {
        files: [],
        format: {
          id: 6,
          name: 'film',
        },
        format_details: {
          ad_strip_test: true,
          ad_test_date: '6/6/2001',
          ad_test_level: '2',
          can_label: 'Can label',
          color: {
            'id': 1,
            'name': 'foo',
          },
          date_of_film: '6/10/2022',
          duration: '01:16:52',
          edge_code_date: 2022,
          film_base: {
            'id': 1,
            'name': 'baz',
          },
          film_emulsion: {
            'id': 1,
            'name': 'qux',
          },
          film_gauge: {
            'id': 1,
            'name': 'bar',
          },
          film_image_type: {
            'id': 1,
            'name': 'quux',
          },
          film_length: 144,
          film_shrinkage: 32,
          film_speed: {
            'id': 1,
            'name': 'quuz',
          },
          film_title: 'Title of film',
          leader_label: 'Leader Labe',
          soundtrack: {
            'key': 'soundtrack',
            'value': 2,
          },
          wind: {
            'id': 1,
            'name': 'corg',
          },
        },
        format_id: 6,
        inspection_date: '5/25/2022',
        item_id: 6,
        name: 'Film Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '7/2/2022',
      },
      'Film Shrinkage',
    ],
    [
      'GroovedDisc',
      {
        files: [],
        format: {
          id: 5,
          name: 'grooved disc',
        },
        format_details: {
          date_of_disc: '5/16/2022',
          disc_base: null,
          disc_diameter: null,
          playback_direction: null,
          disc_material: null,
          playback_speed: null,
          side_a_duration: '00:12:21',
          side_a_label: 'side 1',
          side_b_duration: '00:12:22',
          side_b_label: 'side b',
          title_of_album: 'title of album',
          title_of_disc: 'title of disc',
        },
        format_id: 5,
        inspection_date: '6/9/2022',
        item_id: 5,
        name: 'Grooved Disc Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '6/29/2022',
      },
      'title of album',
    ],
    [
      'GroovedDisc - minimal',
      {
        files: [],
        format: {
          id: 5,
          name: 'grooved disc',
        },
        format_details: {
          date_of_disc: null,
          disc_base: null,
          disc_diameter: null,
          playback_direction: null,
          disc_material: null,
          playback_speed: null,
          side_a_duration: null,
          side_a_label: null,
          side_b_duration: null,
          side_b_label: null,
          title_of_album: 'title of album',
          title_of_disc: null,
        },
        format_id: 5,
        inspection_date: '6/9/2022',
        item_id: 5,
        name: 'Grooved Disc Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '6/29/2022',
      },
      'title of album',
    ],
    [
      'GroovedDisc all metadata',
      {
        files: [],
        format: {
          id: 5,
          name: 'grooved disc',
        },
        format_details: {
          date_of_disc: '5/16/2022',
          disc_base: {
            'id': 1,
            'name': 'foo',
          },
          disc_diameter: {
            'id': 1,
            'name': 'bar',
          },
          playback_direction: {
            'id': 1,
            'name': 'baz',
          },
          disc_material: {
            'id': 1,
            'name': 'qux',
          },
          playback_speed: {
            'id': 1,
            'name': 'quux',
          },
          side_a_duration: '00:12:21',
          side_a_label: 'side 1',
          side_b_duration: '00:12:22',
          side_b_label: 'side b',
          title_of_album: 'title of album',
          title_of_disc: 'title of disc',
        },
        format_id: 5,
        inspection_date: '6/9/2022',
        item_id: 5,
        name: 'Grooved Disc Item',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '6/29/2022',
      },
      'title of album',
    ],
    [
      'Optical',
      {
        files: [],
        format: {
          id: 8,
          name: 'optical',
        },
        format_details: {
          date_of_item: '1/2/2000',
          duration: '01:55:1',
          label: 'Label',
          title_of_item: 'Title of item',
          type: null,
        },
        format_id: 8,
        inspection_date: '1/2/2020',
        item_id: 7,
        name: 'My optical',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '1/2/2030',
      },
      'Title of item',
    ],
    [
      'Optical - minumal',
      {
        files: [],
        format: {
          id: 8,
          name: 'optical',
        },
        format_details: {
          date_of_item: null,
          duration: null,
          label: null,
          title_of_item: 'Title of item',
          type: null,
        },
        format_id: 8,
        inspection_date: '1/2/2020',
        item_id: 7,
        name: 'My optical',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '1/2/2030',
      },
      'Title of item',
    ],
    [
      'Optical all metadata',
      {
        files: [],
        format: {
          id: 8,
          name: 'optical',
        },
        format_details: {
          date_of_item: '1/2/2000',
          duration: '01:55:1',
          label: 'Label',
          title_of_item: 'Title of item',
          type: {
            'id': 1,
            'name': 'foo',
          },
        },
        format_id: 8,
        inspection_date: '1/2/2020',
        item_id: 7,
        name: 'My optical',
        notes: [],
        obj_sequence: null,
        parent_object_id: 1,
        transfer_date: '1/2/2030',
      },
      'Title of item',
    ],
  ])('Test format %p', async (name, data, expectedString)=>{
    const {getByText} = render(<FormatDetails apiData={data} apiUrl='/foo'/>);
    await (()=>{
      expect(getByText(expectedString)).toBeInTheDocument();
    });
  });
});
