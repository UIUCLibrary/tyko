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
            projectFormDialog.projectTitle = ""
            projectFormDialog.projectCode = ""
            projectFormDialog.status = ""
            projectFormDialog.currentLocation = ""
            projectFormDialog.open()
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
        sourceURL: "http://0.0.0.0:5000/"
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

    function openEditor(row){
        var row = row || 0


        var item = projectsModel.get(row)
        console.log("id = " + item.id)


        projectFormDialog.projectTitle = item.title
        projectFormDialog.projectCode = item.project_code
        projectFormDialog.status = item.status
        projectFormDialog.currentLocation = item.current_location

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
