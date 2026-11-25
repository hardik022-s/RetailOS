# How to run RetailOS (Backend + Frontend) in VS Code

Needs: Python 3.10 or newer (Django 5.2 requirement). Check with `python --version`.

## 1. Open the project
VS Code -> File -> Open Folder -> choose the `AI framework` folder.
Open a terminal: Ctrl + ` (backtick).

## 2. Start the BACKEND (terminal 1)

Windows (PowerShell):
    cd Backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

Mac / Linux:
    cd Backend
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

When it works you will see: "Starting development server at http://127.0.0.1:8000/"
Test it: open http://127.0.0.1:8000/api/health in the browser. It should show {"status": "ok", ...}

If PowerShell blocks the activate script, run once:
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

## 3. Start the FRONTEND (terminal 2, click the "+" in the terminal panel)
    cd Frontend
    python -m http.server 5500
Then open http://localhost:5500 in your browser.

(Or install the "Live Server" extension, right-click Frontend/index.html -> Open with Live Server.)

## 4. Check that it is connected
The app pings http://127.0.0.1:8000/api/health on start. If the backend is running,
the app is in connected mode. If not, it falls back to demo mode automatically.
Keep BOTH terminals running while you use the app.

## Troubleshooting
- "No module named lightgbm / pandas": the venv is not activated. Activate it and run
  `pip install -r requirements.txt` again.
- Page still shows demo mode: make sure the backend is on port 8000 and refresh with Ctrl+Shift+R.
- Port 8000 busy: run `python manage.py runserver 8001` and set in Frontend/js/config.js
  API_BASE to 'http://127.0.0.1:8001/api'.
- Page looks unstyled: you need internet (Tailwind and fonts load from a CDN).
