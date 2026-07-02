' MingYi ChengZhangLu v9 - One-click Launcher
' Double-click to start dev server and open browser

Set WshShell = WScript.CreateObject("WScript.Shell")

projectPath = "D:\Users\Chen\Desktop\经方学习系统（旧版）\app\v9"
url = "http://localhost:5173/"

' Start Vite dev server (hidden window)
WshShell.Run "cmd /c cd /d """ & projectPath & """ && npm run dev", 0, False

' Wait for server to start
WScript.Sleep 7000

' Open browser
WshShell.Run url, 1, False

' Notify user
MsgBox "Server started!" & vbCrLf & vbCrLf & _
       "Opening: " & url & vbCrLf & vbCrLf & _
       "Tip: Run '停止服务器.vbs' to stop, or end node.exe in Task Manager.", _
       vbInformation, "MingYi v9"

Set WshShell = Nothing
