cmake_minimum_required(VERSION 3.13)
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

add_executable(${PROJECT_NAME} "main.cpp" "qml.qrc")

target_link_libraries(${PROJECT_NAME}
        PRIVATE
            Qt5::Core
            Qt5::Quick
            ProjectAdder
        )

enable_testing()
add_executable(tst_editor "tst_editor.cpp" "tests.qrc")

target_link_libraries(tst_editor
        PRIVATE
            Qt5::QuickTest
            Qt5::Quick
            ProjectAdder

        )

add_dependencies(tst_editor ${PROJECT_NAME})
add_test(tst_editor tst_editor -input ${CMAKE_CURRENT_SOURCE_DIR})
