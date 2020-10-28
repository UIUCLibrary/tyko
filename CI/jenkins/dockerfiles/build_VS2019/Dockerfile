# escape=`
ARG FROM_IMAGE=mcr.microsoft.com/dotnet/framework/sdk:4.8
FROM ${FROM_IMAGE} as BASE_BUILDER
SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop';"]
# First install Visual Studio Build Tools
RUN Invoke-WebRequest https://aka.ms/vs/16/release/vs_buildtools.exe -OutFile ${Env:TEMP}\\vs_buildtools.exe ; `
    Invoke-WebRequest https://aka.ms/vs/16/release/channel -OutFile ${Env:TEMP}\\VisualStudio.chman ; `
    Invoke-WebRequest https://aka.ms/vscollect.exe  -OutFile ${Env:TEMP}\\collect.exe ; `
    Write-Host "Installing Visual Studio Build Tools" ; `
    Start-Process -NoNewWindow -FilePath $Env:TEMP\\vs_buildtools.exe -ArgumentList '--quiet  --installPath "C:\\BuildTools"  --wait --norestart --nocache --add Microsoft.VisualStudio.Workload.VCTools --add Microsoft.VisualStudio.Component.VC.CLI.Support --add Microsoft.VisualStudio.Component.VC.Tools.x86.x64 --add Microsoft.VisualStudio.Component.Windows10SDK.18362' -Wait  ; `
    Write-Host "Installing Visual Studio Build Tools - Done" ; `
    Write-Host "Testing for VsDevCmd.bat" ; `
    if (! (Test-Path 'C:\BuildTools\Common7\Tools\VsDevCmd.bat')) `
    { `
        Start-Process -NoNewWindow -FilePath $Env:TEMP\\collect.exe -ArgumentList '-nologo -zip:${Env:TEMP}\\vslogs.zip' -Wait; `
        Expand-Archive -Path vslogs.zip -DestinationPath $Env:TEMP\\logs\\ ; `
        ls c:\\ ; `
        tree /F /A; `
        Get-Content -LiteralPath '$Env:TEMP\\logs\\[Content_Types].xml' ; `
        throw 'VsDevCmd.bat not found' ; `
    } ; `
    Write-Host "Testing for VsDevCmd.bat - Found" ; `
    Write-Host "Cleaning up $Env:TEMP" ; `
    Remove-Item -Force -Recurse $Env:TEMP\* ; `
    Write-Host "Cleaning up $Env:TEMP - Done"

ADD CI/jenkins/dockerfiles/build_VS2019/startup.bat c:\temp\startup.bat
RUN Set-ItemProperty -Path 'HKLM:\Software\Microsoft\Command Processor' -Name 'AutoRun' -Value "c:\temp\startup.bat"

ARG CHOCOLATEY_REPO=https://chocolatey.org/api/v2

ARG ChocolateyEnvironmentDebug=false
ADD CI/jenkins/dockerfiles/shared/install_choco.ps1 choco/install_choco.ps1
RUN Set-ExecutionPolicy Bypass -Scope Process -Force; `
    ./choco/install_choco.ps1 -packageRepo $env:CHOCOLATEY_SOURCE ; `
    if( -not ([string]::IsNullOrEmpty($Env:CHOCOLATEY_SOURCE ))) `
    { `
        Write-Host "Adding $env:CHOCOLATEY_SOURCE to chocolatey sources" ; `
        choco source add -n=CHOCOLATEY_SOURCE --priority=1 -s=\"$env:CHOCOLATEY_SOURCE\"; `
        choco source remove -n=chocolatey ; `
    }; `
    Remove-Item C:\ProgramData\chocolatey\bin\cpack.exe ; `
    Remove-Item -Force -Recurse ${Env:TEMP}\*


# Install packages that can be installed by chocolatey
ADD CI/jenkins/dockerfiles/build_VS2019/chocolatey/packages.config choco/packages.config
RUN C:\ProgramData\chocolatey\bin\choco.exe sources ; `
    C:\ProgramData\chocolatey\bin\choco.exe install -y --stoponfirstfailure --no-progress choco/packages.config ;`
    Remove-Item C:\Users\ContainerAdministrator\AppData\Local\Temp\chocolatey -Recurse ; `
    Remove-Item -Force -Recurse ${Env:TEMP}\* ; `
    $env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User') ; `
    cmake --version ; `
    git --version ; `
    if (! (Test-Path 'C:\BuildTools\Common7\Tools\VsDevCmd.bat')) `
    { `
        throw 'VsDevCmd.bat not found' ; `
    }; `
    Write-Host "Finished install packages with Chocolatey"


# Install WiX toolset for making .msi installers and put the tools on the path
ADD CI/jenkins/dockerfiles/build_VS2019/nuget/packages.config nuget/packages.config
RUN Install-PackageProvider -Name NuGet -MinimumVersion 2.8.5.201 -Force ; `
    nuget update -self ;`
    nuget install nuget/packages.config -OutputDirectory c:\BuildTools\ ; `
    [Environment]::SetEnvironmentVariable('PATH', \"$($env:Path);$((Get-Childitem -Path C:\BuildTools -Include wix.dll -File -Recurse)[0].DirectoryName)\", [EnvironmentVariableTarget]::Machine)

FROM BASE_BUILDER as CONAN_BASE
RUN [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; `
    $Env:PYTHONUNBUFFERED = 0 ; `
    python -m pip install pip wheel --no-cache-dir --upgrade ; `
    pip install --no-cache-dir conan ;`
    Write-Output "Finished installing Conan"
ENV CONAN_USER_HOME=C:/Users/ContainerAdministrator
FROM CONAN_BASE as CONAN_CACHE_BUILDER

#ENV CONAN_USER_HOME_SHORT=C:/Users/ContainerAdministrator/.conan
ENV CONAN_COLOR_DISPLAY=0
ENV CONAN_NON_INTERACTIVE=1
COPY CI/jenkins/dockerfiles/build_VS2019/conan/profiles/default C:/Users/ContainerAdministrator/.conan/profiles/default
COPY CI/jenkins/dockerfiles/build_VS2019/conan/remotes.json C:/Users/ContainerAdministrator/.conan/remotes.json

COPY conanfile.py c:/temp/conanfile.py
RUN conan config init ; `
    conan config home
ADD ["CI/jenkins/dockerfiles/build_VS2019/vcvarsall.bat", "C:/Program Files (x86)/Microsoft Visual Studio/2019/BuildTools/VC/Auxiliary/Build/vcvarsall.bat"]

RUN conan install c:/temp/ --build missing --no-import  ; `
    conan remove "*" -b --src -f ; `
    conan remove --locks

FROM CONAN_BASE
COPY --from=CONAN_CACHE_BUILDER C:/Users/ContainerAdministrator/.conan/ C:/Users/ContainerAdministrator/.conan/
COPY --from=CONAN_CACHE_BUILDER C:/.conan/ C:/.conan/
COPY conanfile.py c:/temp/conanfile.py
RUN conan install c:/temp/ --build missing --no-import  ; `
    conan remove "*" -b --src -f ; `
    conan remove --locks

## This is to redirect anything that might require that visual studio vcvarsall.bat be in fixed spot
#
#RUN Set-ItemProperty -Path 'HKLM:\Software\Microsoft\Command Processor' -Name 'AutoRun' -Value "c:\temp\startup.bat"
#RUN certutil -generateSSTFromWU roots.sst ; `
#    certutil -addstore -f root roots.sst ; `
#    del roots.sst
#COPY conanfile.py C:/TEMP/
#RUN conan install C:/TEMP/ --build  missing --no-import ;`
#    conan remove * -b --src -f

SHELL ["cmd", "/S", "/C"]
