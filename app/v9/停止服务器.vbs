' MingYi ChengZhangLu v9 - Stop Server
' Double-click to kill all Node.js processes

Set WshShell = WScript.CreateObject("WScript.Shell")

' Kill node.exe processes
result = WshShell.Run("taskkill /F /IM node.exe", 0, True)

If result = 0 Then
    MsgBox "Server stopped successfully.", vbInformation, "MingYi v9"
Else
    MsgBox "No running server found (or already stopped).", vbExclamation, "MingYi v9"
End If

Set WshShell = Nothing
