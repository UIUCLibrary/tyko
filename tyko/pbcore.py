from .exceptions import DataError
from .data_provider import DataProvider, ObjectDataConnector
from lxml import etree
from jinja2 import Template

PBCORE_OBJECT_TEMPATE = """<pbcoreDescriptionDocument xmlns="http://www.pbcore.org/PBCore/PBCoreNamespace.html"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.pbcore.org/PBCore/PBCoreNamespace.html" >
    <pbcoreIdentifier source="TYKO-OBJECT-ID">{{ object_id }}</pbcoreIdentifier>
    <pbcoreTitle titleType="Main">{{ name }}</pbcoreTitle>
    <pbcoreDescription/>
</pbcoreDescriptionDocument>
"""

def create_pbcore_from_object(object_id: int, data_provider: DataProvider) -> str:
    template = Template(PBCORE_OBJECT_TEMPATE)
    connector = ObjectDataConnector(data_provider.session)
    resulting_object = connector.get(object_id)[0]
    xml = template.render(name=resulting_object.name, object_id=resulting_object.id)
    return xml
