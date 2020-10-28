Feature: database
  Connection to the database

  Scenario: Create a new user
    Given a blank database
    And a contact for a collection
    When the contact is added to the database
    Then the database has 1 Contact records
    And the collection contact can be found in the database

  Scenario: Create a new collection
    Given a blank database
    When a new collection is created with a contact
    Then the new collection can be found in the database
    And the database has 1 Contact records
    And the database has 1 Collection records
    And the contact to the collection is expected value

  Scenario: Create a new project
    Given a database with a collection
    And a new Project
    When the project is added to the collection
    Then the database has 1 Project records
    And the collection contains the new project

  Scenario: Create a new project with a note
    Given a database with a collection
    And a new Project note is created
    When a new Project with a project note
    Then the database has 1 Project records
    Then the database has 1 Note records
    And the collection contains the new project
    And all the Project records can be serialize
    And all the Note records can be serialize


  Scenario: Create a new object
    Given a database with a collection
    And a staff contact named Henry Borchers
    And a new object for the collection with a barcode
    When a object is added to the collection
    Then the database has 1 Project records
    And the database has 2 Contact records
    And the database has 1 Collection records
    And the database has 1 CollectionObject records
    And the new object record contains the correct barcode
    And all the CollectionObject records can be serialize
    And all the Collection records can be serialize
    And all the Contact records can be serialize

  Scenario: Create a new item
    Given a database with a collection
    And a staff contact named Henry Borchers
    And a new object for the collection with a barcode
    And a new audio video item is created by the staff
    When the item is added to the object
    Then the database has 1 Project records
    And the database has 1 Collection records
    And the database has 1 CollectionObject records
    And the database has 1 CollectionItem records


  Scenario: Create a new inspection note for item
    Given a database with a collection
    And a staff contact named Henry Borchers
    And a new object for the collection with a barcode
    And a new audio video item is created by the staff
    And a new Inspection note is created
    When the item is added to the object
    And the new note is added to the CollectionItem
    Then the database has 1 Note records
    And the CollectionItem record has the new note

  Scenario: Create a new inspection note for project
    Given a database with a collection
    And a staff contact named Henry Borchers
    And a new object for the collection with a barcode
    And a new audio video item is created by the staff
    And a new Inspection note is created
    When the item is added to the object
    And the new note is added to the Project
    Then the database has 1 Note records
    And the Project record has the new note

  Scenario: Create a new inspection note for CollectionObject
    Given a database with a collection
    And a staff contact named Henry Borchers
    And a new object for the collection with a barcode
    And a new audio video item is created by the staff
    And a new Inspection note is created
    When the item is added to the object
    And the new note is added to the CollectionObject
    Then the database has 1 Note records
    And the CollectionObject record has the new note

  Scenario: Item is sent for treatment
    Given a database with a collection
    And a staff contact named Henry Borchers
    And a new object for the collection with a barcode
    And a new audio video item is created by the staff
    And a new treatment record is created that needs "X, Y, Z treatment" and got "Y treatment only"
    When the new treatment record is added to the item
    And the item is added to the object
    Then the database has 1 CollectionObject records
    And the database has 1 Treatment records
    And the treatment record of the item states that it needs "X, Y, Z treatment" and got "Y treatment only"
    And all the Treatment records can be serialize


  Scenario Outline: Create a new media project
    Given a database with a collection
    And a staff contact named <first_name> <last_name>
    And a new object for the collection with a barcode
    And a new <media_type> item with <file_name> added to the object
    Then the database has 1 CollectionObject records
    And the database has item record with the <file_name> and has a corresponding <media_type> record in a <format_class> with the same item id

    Examples:
    | first_name | last_name | media_type         |  file_name    | format_class |
    | Henry      | Borchers  | open reel          |  myfile.wav   | OpenReel     |
    | John       | Smith     | open reel          |  my2file.wav  | OpenReel     |
    | John       | Smith     | film               |  myfilm.mov   | Film         |
#    | John       | Smith     | grooved disc       |  mydisc.wav   |
#    | John       | Smith     | audio video        |  myvideo.mov  |


  Scenario Outline: Create a open reel project
    Given a database with a collection
    And a staff contact named <first_name> <last_name>
    And a new object for the collection with a barcode
    When a new open reel item recorded on <date_recorded> to <tape_size> tape on a <base> base with <file_name> added to the object
    Then the database has 1 OpenReel records
    And the database has 1 CollectionObject records
    And the database has item record with the <file_name>
    And the database has open reel record with a <tape_size> sized tape
    And the database has open reel record with a <base> base

    Examples:
    | first_name | last_name | file_name    | date_recorded | tape_size | base      |
    | Henry      | Borchers  | myfile.wav   | 1970/1/1      | 1/4 inch  | acetate   |
    | John       | Smith     | my2file2.wav | 1998/2/10     | 1/4 inch  | polyester |


  Scenario Outline: Create a vendor
    Given an empty database
    When a new vendor named <vendor_name> from <address> in <city>, <state> <zipcode> is added
    Then the database has 1 Vendor records
    And the newly created vendor has the name <vendor_name>
    And the newly created vendor is located in <city> city
    And the newly created vendor is located in <state> state
    And the newly created vendor is has a <zipcode> zipcode
    And all the Vendor items in the database can be serialized

    Examples:
    | vendor_name      | address          | city    | state | zipcode |
    | Alias AV Vendor  | 123 Fake Street  | Gothum  | NY    | 12345   |

  Scenario Outline: Create a vendor contacts
    Given an empty database
    When a new vendor named <vendor_name> from <address> in <city>, <state> <zipcode> is added
    And <contact_first_name> <contact_last_name> is added as a contact to the vendor named <vendor_name>
    Then the vendor named <vendor_name> has a contact named <contact_first_name> <contact_last_name>
    And all the Contact items in the database can be serialized

  Examples:
  | contact_first_name | contact_last_name | vendor_name      | address          | city    | state | zipcode |
  | John               | Smith             | Alias AV Vendor  | 123 Fake Street  | Gothum  | NY    | 12345   |


  Scenario Outline: Send an object to a vendor
    Given an empty database
    And a staff contact named <staff_first_name> <staff_last_name>
    And a new object for the collection with a barcode
    When a new vendor named <vendor_name> from <address> in <city>, <state> <zipcode> is added
    And the object is sent to the vendor <vendor_name>
    Then the database has 1 VendorTransfer records
    And there is a new transfer for the new object sent to <vendor_name>
    And all the VendorTransfer items in the database can be serialized

  Examples:
  | staff_first_name   | staff_last_name   | vendor_name      | address          | city    | state | zipcode |
  | John               | Smith             | Alias AV Vendor  | 123 Fake Street  | Gothum  | NY    | 12345   |

  Scenario: Create a new Groove Disc object
    Given a database with a collection
    And a new object for the collection with a barcode
    And a new GroovedDisc item is created
    Then all the GroovedDisc items in the database can be serialized

  Scenario: Create a new Film object
    Given a database with a collection
    And a new object for the collection with a barcode
    And a new Film item is created
    Then all the Film items in the database can be serialized

  Scenario: Create a new OpenReel object
    Given a database with a collection
    And a new object for the collection with a barcode
    And a new OpenReel item is created
    Then all the OpenReel items in the database can be serialized

Scenario Outline: Create a new media project where a file has a note and an annotation
    Given a database with a collection
    And a new object for the collection with a barcode
    And annotations for <annotation_type> configured in the database
    When a new <media_type> item with <file_name> with <note> and an annotation of <annotation_type> and <annotation_content> added to the object
    Then the database has 1 CollectionObject records
    And the database has item record with the <file_name> that contains a note that reads <note>
    And the database has item record with the <file_name> that contains a <annotation_type> annotation containing <annotation_content>

    Examples:
    | media_type   |  file_name    | note         | annotation_type      | annotation_content       |
    | open reel    |  myfile.wav   | sample note  | Encode Software Name | Wavelab                  |
    | film         |  myfilm.mkv   | another note | Video Capture Card   | AJA KONA LHe Plus HD-SDI |

Scenario Outline: Create a new media project with audio cassettes
    Given a database with a project and a collection
    And a new <object_title> audio recording is added
    When a tape named <item_title> recorded on <date_recorded> using a <audio_type> type <tape_type> and <tape_thickness> which was inspected on <inspection_date>
    Then the database has 1 AudioCassette records
    And the database has a an object entitled <object_title> with an AudioCassette
    And AudioCassette in <object_title> is titled <item_title> was recorded on the date <date_recorded>
    And AudioCassette in <object_title> with title <item_title> used type <tape_type> cassette and with <tape_thickness>
    And AudioCassette in <object_title> with title <item_title> was inspected on <inspection_date>

    Examples:
    | object_title           | item_title         | date_recorded | audio_type       | tape_type | tape_thickness | inspection_date |
    | John Doe Oral history  | The beginning part | 11-26-1999    | compact cassette | I         | "0.5"          | 12-10-2019      |
    | Brass Band Recording   |                    | 01-1997       | ADAT             |           | "0.5"          | 12-12-2019      |
    | Famous Amazing Speech  |                    | 1997          | DAT              |           | NA             | 12-11-2019      |
