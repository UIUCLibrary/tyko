 setlocal
 if not exist c:\TEMP\build mkdir c:\TEMP\build
 xcopy c:\build c:\TEMP\build
 cd c:\TEMP\build && cpack -G NSIS -G WIX
 copy *.msi c:\dist\
 endlocal