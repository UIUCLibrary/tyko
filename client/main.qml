import QtQuick 2.9
import QtQuick.Controls 2.5
import QtQuick.Layouts 1.3

ApplicationWindow {
    id: window
    visible: true
    width: 640
    height: 480
    property int dataRefreshRate: 2000
    title: qsTr("Projects")
    SystemPalette { id: appPalette; colorGroup: SystemPalette.Active }


    Action{
        id: newItemAction
        text: "New"
        icon.name: "document-new"
        onTriggered:{
            newProjectFormDialog.projectTitle = ""
            newProjectFormDialog.projectCode = ""
            newProjectFormDialog.status = ""
            newProjectFormDialog.currentLocation = ""
            newProjectFormDialog.open()
         }
        shortcut: StandardKey.New
    }

    Action{
        id: openItemAction
        text: "Edit"
        icon.name: "document-open"
        onTriggered: openEditor(projectsView.currentRow)
        shortcut: StandardKey.Open
        enabled: projectsView.validSelection

    }

    Action{
        id: deleteItemAction
        text: "Delete"
        icon.name: "edit-delete"
        onTriggered: deleteByRow(projectsView.currentRow)
        shortcut: StandardKey.Delete
        enabled: projectsView.validSelection
    }


    EditingDialog {
        id: projectFormDialog
        standardButtons: Dialog.Save | Dialog.Cancel
    }
    EditingDialog {
        id: newProjectFormDialog
        title: "New Project"
        standardButtons: Dialog.Save | Dialog.Cancel
        onAccepted: {

            createNewProject(this)

        }
    }

    Dialog{
        id: confirmDeleteDialog
        title: "Are you sure?"
        standardButtons: Dialog.Yes | Dialog.Cancel
    }

    Dialog{
        id: createNewRecordDialog
        title: "New Record"
    }

    Dialog{
        id: editRecordDialog
        title: "Edit Record"
    }
    Dialog{
        property alias message: text.text
        id: resultDialog
        title: "Result"
        width: 400
        height: 200
        x: (parent.width - width) / 2
        y: (parent.height - height) / 2
        padding: 20
        Rectangle{
            color: appPalette.dark
            anchors.fill: parent
            Text {
                id: text
                color: appPalette.light
                padding: 10
            }
            border.color: appPalette.shadow

        }
        standardButtons: Dialog.Ok


    }

    Component {
        id: component_contextMenu
        Menu{
            id: myContextMenu

            MenuItem{
                action: openItemAction
            }
            MenuItem{
                action: deleteItemAction
            }
        }
    }
    header: ToolBar{
        id: toolbar
        Flow{

            width: parent.width
            Row{
                id: editToolsRow
                ToolButton{
                    action: newItemAction
                }
                ToolButton{
                    action: openItemAction
                }

                ToolButton{
                    action: deleteItemAction
                }
                ToolSeparator{
                    contentItem.visible: editToolsRow.y === searchToolsRow.y
                }
            }
            Row{
                id: searchToolsRow
                TextField{
                    placeholderText: "Search..."
                    width: toolbar.width - editToolsRow.width - toolbar.spacing
                }
                visible: false
            }

        }
    }
    ApiModel {
        id: projectsModel
        sourceURL: "http://127.0.0.1:5000/"
        apiRoute: "api/projects"
    }

    Rectangle{
        anchors.fill: parent
        color: appPalette.base
        ProjectsViewTable {
            id: projectsView
            clip: true
            contextMenu: component_contextMenu
            onActivated: {
                openEditor(row)
            }
        }
    }
    footer:ToolBar{
        RowLayout{
            Label{
                id: statusMessage
            }
        }
    }

    function createNewProject(dialog){
        var projectTitle = dialog.projectTitle
        var projectCode = dialog.projectCode
        var status = dialog.status
        var currentLocation = dialog.currentLocation
        console.log("new project")
        console.log("projectTitle: " + projectTitle)
        console.log("projectCode: " + projectCode)
        resultDialog.message = "Added new record"
        resultDialog.open()
    }

    function openEditor(row){
        var row = row || 0


        var item = projectsModel.get(row)
        console.log("id = " + item.id)

        projectFormDialog.projectTitle = item.title
        projectFormDialog.projectCode = item.project_code
        projectFormDialog.status = item.status ? item.status: ""
        projectFormDialog.currentLocation = item.current_location ? item.current_location:

        projectFormDialog.open()

    }
    function deleteByRow(row){
        confirmDeleteDialog.open()
        statusMessage.text = "deleting row " + row
    }

    Timer{
        interval: dataRefreshRate
        repeat: true
        running: true
        onTriggered: {
            projectsModel.updateData()
        }
    }

    Component.onCompleted: {
        console.log(projectsModel.model)
        projectsView.model = projectsModel.model
    }
}
