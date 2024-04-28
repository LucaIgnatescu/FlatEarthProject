from flask import Flask, flash, redirect, render_template, request, url_for


app = Flask(__name__)

@app.route("/tutorial")
@app.route("/")
def tutorial():
    return render_template('tutorial.html')


@app.route("/globe")
def globe():
    return render_template('3d.html')


@app.route("/plane")
def plane():
    return render_template('2d.html')


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug = False)

# 
# FLASK_APP=main.py FLASK_ENV=development flask run
