cmake_minimum_required(VERSION 3.14)
project(avdatabase)

add_subdirectory(client)
include(CPackConfig.cmake)
include(CPack)
