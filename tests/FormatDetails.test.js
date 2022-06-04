/**
 * @jest-environment jsdom
 */
import axios from 'axios';
import React from 'react';
import '@testing-library/jest-dom';


import {
  render,
  waitForElementToBeRemoved,
  cleanup,
} from '@testing-library/react';
import FormatDetails from '../tyko/static/js/reactComponents/FormatDetails';

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

beforeEach(() => {
  axios.get = jest.fn(() => {
    Promise.resolve({data: {data: mockResponseAudioCassette}});
  });
});

afterEach(cleanup);

describe('FormatDetails', ()=>{
  it('displays text "loading" while fetching data', ()=>{
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    getByText('Loading...');
  });

  it('Removes text "Loading" after data has been fetched', async ()=>{
    axios.get.mockResolvedValueOnce({data: {item: mockResponseAudioCassette}});
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    await waitForElementToBeRemoved(()=>getByText('Loading...'));
  });

  it('data is loaded into the document', async ()=> {
    axios.get.mockResolvedValueOnce({data: {item: mockResponseAudioCassette}});
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    await waitForElementToBeRemoved(() => getByText('Loading...'));
    expect(getByText('my cassette title')).toBeInTheDocument();
  });
  it('test unsupported format', async ()=>{
    axios.get.mockResolvedValueOnce(
        {
          data: {
            item: {
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
            },
          },
        },
    );
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    await waitForElementToBeRemoved(() => getByText('Loading...'));
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
          disc_direction: null,
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
          disc_direction: {
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
    axios.get.mockResolvedValueOnce(
        {data: {item: data}},
    );
    const {getByText} = render(<FormatDetails apiUrl='/foo'/>);
    await waitForElementToBeRemoved(() => getByText('Loading...'));
    expect(getByText(expectedString)).toBeInTheDocument();
  });
});
