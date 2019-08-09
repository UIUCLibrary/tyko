# escape=`

ARG FROM_IMAGE=microsoft/dotnet-framework:3.5-sdk-windowsservercore-1709
FROM ${FROM_IMAGE}

# Reset the shell.
SHELL ["cmd", "/S", "/C"]

#COPY Install.cmd C:/TEMP/
ADD https://aka.ms/vscollect.exe C:/TEMP/collect.exe

# Install Node.js LTS
ADD https://nodejs.org/dist/v8.11.3/node-v8.11.3-x64.msi C:/TEMP/node-install.msi
RUN start /wait msiexec.exe /i C:/TEMP/node-install.msi /l*vx "%TEMP%\MSI-node-install.log" /qn ADDLOCAL=ALL

# Download channel for fixed install.
ARG CHANNEL_URL=https://aka.ms/vs/15/release/channel
ADD ${CHANNEL_URL} C:/TEMP/VisualStudio.chman

# Download and install Build Tools for Visual Studio 2017 for native desktop workload.
ADD https://aka.ms/vs/15/release/vs_buildtools.exe C:/TEMP/vs_buildtools.exe
RUN C:\\TEMP\\vs_buildtools.exe `
    --quiet --wait --norestart --nocache `
    --channelUri C:\\TEMP\\VisualStudio.chman `
    --installChannelUri C:\\TEMP\\VisualStudio.chman `
    --add Microsoft.VisualStudio.Workload.VCTools `
    --add Microsoft.VisualStudio.Component.VC.140 `
    --add Microsoft.VisualStudio.Component.VC.ATL `
    --add Microsoft.VisualStudio.Component.VC.CLI.Support `
    --includeRecommended `
    --installPath C:\BuildTools `
  || IF "%ERRORLEVEL%"=="3010" EXIT 0

RUN @"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
RUN choco install -y cmake --installargs 'ADD_CMAKE_TO_PATH=System'
RUN choco install -y python ninja
RUN python -m pip install --upgrade pip && python -m pip install conan

COPY conanfile.txt C:/source/
ENV CONAN_COLOR_DISPLAY=0
ENV CONAN_NON_INTERACTIVE=1
RUN conan remote add -f bincrafters https://api.bintray.com/conan/bincrafters/public-conan
RUN mkdir build && cd build && conan install C:/source/ --build  missing --no-import

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
ENTRYPOINT C:\\BuildTools\\Common7\\Tools\\VsDevCmd.bat &&
CMD ["powershell.exe", "-NoLogo", "-ExecutionPolicy", "Bypass"]