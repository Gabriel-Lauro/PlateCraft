from flask import make_response
import json

def json_response(data, status=200):
    """Cria uma resposta JSON com encoding UTF-8"""
    response = make_response(json.dumps(data, ensure_ascii=False, indent=2), status)
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    return response