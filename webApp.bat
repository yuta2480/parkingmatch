call env3810\Scripts\activate
start cmd /k "python app.py"
start "" http://localhost:5000
call cmd /k "C:\ngrok http 5000"
