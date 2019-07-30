cmake_minimum_required(VERSION 3.14)
project(avdatabaseEditor LANGUAGES CXX)

set(CMAKE_INCLUDE_CURRENT_DIR ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)

find_package(CURL REQUIRED)
find_package(Qt5 REQUIRED
        COMPONENTS
            Core
            Quick
        OPTIONAL_COMPONENTS
            QuickTest
        )
add_library(ProjectAdder OBJECT
        projectadder.cpp
        CurlPostBehavior.cpp

        qtPostBehavior.cpp qtPostBehavior.h)

target_link_libraries(ProjectAdder
    PUBLIC
        Qt5::Core
        Qt5::Quick
        CURL::libcurl
        )

add_executable(avdatabaseEditor "main.cpp" "qml.qrc")

target_link_libraries(avdatabaseEditor
        PRIVATE
            Qt5::Core
            Qt5::Quick
            ProjectAdder
        )
get_target_property(editor_apple_bundle avdatabaseEditor MACOSX_BUNDLE)

if(editor_apple_bundle)
    message(WARNING "MAKING A BUNDLE")
    install(CODE [[
        include(BundleUtilities)
        copy_and_fixup_bundle($<TARGET_BUNDLE_DIR:avdatabaseEditor> ${CMAKE_INSTALL_PREFIX}/avdatabaseEditor.app "" "")
    ]])
endif()

enable_testing()
add_executable(tst_editor "tst_editor.cpp" "tests.qrc")

target_link_libraries(tst_editor
        PRIVATE
            Qt5::QuickTest
            Qt5::Quick
            ProjectAdder

        )

set_target_properties(avdatabaseEditor PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}
    )

add_dependencies(tst_editor avdatabaseEditor)
add_test(tst_editor tst_editor -input ${CMAKE_CURRENT_SOURCE_DIR})
