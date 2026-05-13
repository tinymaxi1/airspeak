#!/usr/bin/env python3
"""
Argos translate CLI helper.
stdin JSON: {"texts": ["...","..."], "to": "tr"}
stdout JSON: {"translations": ["..."]}
"""
import json
import sys

import argostranslate.translate

data = json.load(sys.stdin)
texts = data['texts']
to_lang = data['to']
from_lang = data.get('from', 'en')

results = []
for t in texts:
    try:
        out = argostranslate.translate.translate(t, from_lang, to_lang)
        results.append(out)
    except Exception as e:
        results.append(t)  # fallback: orijinal

json.dump({'translations': results}, sys.stdout, ensure_ascii=False)
