import os

from conans import ConanFile, CMake


class TykoConan(ConanFile):
    settings = "os", "arch", "compiler", "build_type"
    generators = ["cmake_paths"]
    requires = [
        "qt/5.14.1@bincrafters/stable",
        "bzip2/1.0.8@conan/stable"
    ]

    default_options = {
        "qt:qtquickcontrols": True,
        "qt:qtquickcontrols2": True,
        "qt:with_mysql": False,
        "qt:with_sqlite3": False,
        "qt:qttools": True,
    }

    def build(self):
        cmake = CMake(self)
        cmake_toolchain_file = os.path.join(self.build_folder, "conan_paths.cmake")
        assert os.path.exists(cmake_toolchain_file)
        cmake.definitions["CMAKE_TOOLCHAIN_FILE"] = cmake_toolchain_file
        cmake.configure()
        cmake.build()

    def imports(self):
        self.copy("*.dll", "bin", "bin")
        self.copy("*.dylib", "lib", "lib")
        self.copy("*.dll", "plugins\platforms", "platforms")
        self.copy("*.*", "QtQuick/Controls/", "qml/QtQuick/Controls")

    def package(self):
        self.copy("avdatabaseEditor", "bin", "")
