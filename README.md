# Installation

```bash
# Create a virtual environment
python3 -m venv venv

# Activate venv
source venv/bin/activate

# Install requirements from requirements.txt
pip install -r requirements.txt
```

# Local Deployment
```bash
FLASK_APP=main.py FLASK_ENV=development flask run
```