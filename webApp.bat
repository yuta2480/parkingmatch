call env37\Scripts\activate
start cmd /k "python app.py"
start "" http://localhost:5000
call cmd /k "C:\Users\admin\Desktop\ngrok http 5000"
