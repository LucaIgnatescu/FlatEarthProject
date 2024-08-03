# Hosting

This project is hosted on Fly.io
- Landing: https://flat-earth-challenge.fly.dev/
- Planar Earth version: https://flat-earth-challenge.fly.dev/plane
- Globe Earth version: https://flat-earth-challenge.fly.dev/globe
- Monitoring: https://fly.io/apps/flat-earth-challenge/monitoring

# Local Installation

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

After which the configured URLs should return website assets. By default:

1. Tutorial - http://127.0.0.1:5000
1. Plane - http://127.0.0.1:5000/plane
1. Globe - http://127.0.0.1:5000/globe