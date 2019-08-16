@echo off
setlocal
set "starting_dir=%cd%"
set "DIST_DIR=%cd%\dist\"
if not exist c:\TEMP\build mkdir c:\TEMP\build
xcopy .\build c:\TEMP\build
cd c:\TEMP\build && cpack -G ZIP;NSIS;WIX
if not exist %DIST_DIR% mkdir %DIST_DIR%
copy *.msi %DIST_DIR%
copy *.exe %DIST_DIR%
copy *.zip %DIST_DIR%
endlocal
