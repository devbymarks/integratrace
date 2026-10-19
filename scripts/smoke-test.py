#!/usr/bin/env python3
"""Local API smoke test; creates a sample endpoint and runs one check."""
import json, sys, urllib.request, urllib.error
BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8080').rstrip('/')
def req(path,method='GET',body=None):
 data=None if body is None else json.dumps(body).encode(); r=urllib.request.Request(BASE+path,data=data,method=method,headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(r,timeout=20) as response:
   raw=response.read().decode(); return response.status,json.loads(raw) if raw else None
 except urllib.error.HTTPError as e:
  raw=e.read().decode()
  try: payload=json.loads(raw)
  except Exception: payload=raw
  raise RuntimeError(f'{method} {path} returned HTTP {e.code}: {payload}') from e
def main():
 _,health=req('/api/health'); assert health['status']=='UP'
 body={'name':'IntegraTrace demo endpoint','description':'Created by local smoke test','url':'https://httpbin.org/status/200','method':'GET','expectedStatus':200,'timeoutSeconds':5,'active':True}
 _,item=req('/api/integrations','POST',body); ident=item['id']; print(f'Created integration id={ident}')
 _,check=req(f'/api/integrations/{ident}/checks','POST'); print(f"Check result={check['result']} http={check.get('httpStatus')} latency={check['latencyMs']}ms")
 _,history=req(f'/api/integrations/{ident}/checks'); assert history, 'Check history was not persisted'
 _,dashboard=req('/api/dashboard'); print(f"Dashboard integrations={dashboard['totalIntegrations']} checks={dashboard['checksInWindow']}")
 print('Smoke test completed. A FAILED check can mean the external demo endpoint is unreachable.')
if __name__=='__main__': main()
