FROM buildtools2017:latest
COPY conanfile.txt C:/source/
RUN conan remote add -f bincrafters https://api.bintray.com/conan/bincrafters/public-conan
ENV CONAN_COLOR_DISPLAY=0
ENV CONAN_NON_INTERACTIVE=1
RUN mkdir build && cd build && conan install C:/source/ --build  missing

#RUN mkdir c:\deps\archives
#RUN powershell -Command \
#    $ErrorActionPreference = 'Stop'; \
#    wget https://www.zlib.net/zlib1211.zip -OutFile c:\deps\archives\zlib.zip ; \
#    Expand-Archive -Path c:\deps\archives\zlib.zip -DestinationPath c:\deps\source ; \
#    Remove-Item c:\deps\archives\zlib.zip -Force
#
#RUN cmake -S c:\deps\source\zlib-1.2.11 -B c:\build\zlib -DCMAKE_INSTALL_PREFIX=c:\deps && \
#    cmake --build c:\build\zlib --config Release --target install
#
#ADD https://curl.haxx.se/download/curl-7.65.3.zip c:/deps/archives/curl.zip
#RUN powershell -Command \
#    $ErrorActionPreference = 'Stop'; \
#    Expand-Archive -Path c:\deps\archives\curl.zip -DestinationPath c:\deps\source ; \
#    Remove-Item c:\deps\archives\curl.zip -Force

#TODO: Install perl on windows

#RUN cmake -S c:\deps\source\curl-7.65.3 -B c:\build\curl -DCMAKE_INSTALL_PREFIX=c:\deps && \
#    cmake --build c:\build\curl --config Release --target install

# TODO install http://download.qt.io/archive/qt/5.13/5.13.0/qt-opensource-windows-x86-5.13.0.exe

COPY CMakeLists.txt CPackConfig.cmake C:/source/
COPY client C:/source/client/
#CMD ["dir"]