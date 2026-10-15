import json, os, subprocess, threading, time, tempfile
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect
mode = 'ok'
calls = 0
class Handler(BaseHTTPRequestHandler):
 def log_message(self, *args): pass
 def do_GET(self):
  global calls
  if 'categories' in urlparse(self.path).path:
   data = []
   status = 200
  else:
   calls += 1
   status = 503 if mode == '503' else 200
   if mode == 'timeout': time.sleep(13)
   data = []
  try:
   self.send_response(status);self.send_header('Content-Type','application/json');self.send_header('X-WP-Total','0');self.send_header('X-WP-TotalPages','0');self.end_headers()
   self.wfile.write(b'not-json' if mode == 'json' and 'categories' not in urlparse(self.path).path else json.dumps(data).encode())
  except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError): pass
server=ThreadingHTTPServer(('127.0.0.1',3199),Handler)
threading.Thread(target=server.serve_forever,daemon=True).start()
env={**os.environ,'PORT':'3102','WORDPRESS_URL':'http://127.0.0.1:3199'}
log=open(Path(tempfile.gettempdir()) / 'ascentia-fault-server.log','w')
process=subprocess.Popen(['node','.output/server/index.mjs'],env=env,stdout=log,stderr=log)
try:
 time.sleep(2)
 with sync_playwright() as p:
  b=p.chromium.launch();pg=b.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.goto('http://localhost:3102/products/brands');pg.wait_for_timeout(1200)
  for case in ['503','json','timeout']:
   mode=case;start=calls
   pg.get_by_role('searchbox').fill('test-'+case)
   alert=pg.locator('#product-results [role=alert]')
   expect(alert).to_be_visible(timeout=35000)
   count=calls-start
   print(case,'product attempts',count)
   assert count == (1 if case=='json' else 2),(case,count)
   mode='ok';alert.get_by_role('button',name='Try again',exact=True).click()
   expect(pg.get_by_text('No products found',exact=True)).to_be_visible(timeout=10000)
  assert not errors,errors
  print('PASS HTTP503 retry, malformed JSON no retry, timeout retry, recovery, no page exceptions')
  b.close()
finally:
 process.terminate();process.wait(timeout=10);server.shutdown();log.close()
