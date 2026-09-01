Set WshShell = CreateObject("WScript.Shell")
' Run the Vite server completely invisibly (the 0 means hide window)
WshShell.Run "cmd /c cd /d d:\codih\calorie-tracker && npm run dev", 0, False
