import QtQuick 2.9
import QtQuick.Controls 2.4
import QtQuick.Layouts 1.3
//import QtQuick.Dialogs 1.2

Dialog{
    id: editingDialog
    width: 400
    property alias projectTitle: titleData.text
    property alias projectCode: projectCodeData.text
    property alias status: statusData.text
    property alias currentLocation: currentLocationData.text
    GridLayout{
        columns: 8
        anchors.right: parent.right
        anchors.left: parent.left
        anchors.top: parent.top
        Label{
            text: "Title"
            Layout.columnSpan: 2
        }
        TextField{
            id: titleData
            placeholderText: "Title of project.."
            Layout.columnSpan: 6
            Layout.fillWidth: true
        }
        Label{
            text: "Project Code"
            Layout.columnSpan: 2
        }
        TextField{
            id: projectCodeData
            placeholderText: "Project Code.."
            Layout.columnSpan: 6
            Layout.fillWidth: true
        }
        Label{
            text: "Status"
            Layout.columnSpan: 2
        }
        TextField{
            id: statusData
            placeholderText: "Status"
            Layout.columnSpan: 6
        }
        Label{
            text: "Current Location"
            Layout.columnSpan: 2
        }
        TextField{
            id: currentLocationData
            placeholderText: "Current Location..."
            Layout.columnSpan: 6
        }

    }
    standardButtons: StandardButton.Save | StandardButton.Cancel
}
