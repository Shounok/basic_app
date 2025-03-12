import functools
from flask import (
    Blueprint, flash, g, redirect, render_template, request, session, url_for
)

bp = Blueprint('arcapp', __name__, url_prefix='/arcapp')

@bp.route('/arc')
def arc():
    return render_template('arcv/index.html')