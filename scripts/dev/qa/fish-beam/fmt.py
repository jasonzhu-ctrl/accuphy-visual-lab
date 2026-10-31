import json,sys
for fn in sys.argv[1:]:
    for l in open(fn):
        n,_,r=l.strip().partition(' ')
        try: d,_=json.JSONDecoder().raw_decode(r)
        except Exception: print(l[:260]); continue
        print(n,' '.join(f"{x['at'] if x['at']=='open' else tuple(x['at'])}:{x['first0']}→{x['end']} f{x['first']} m{x['toMin']}" for x in d), r[r.rfind(']')+1:][:120])
