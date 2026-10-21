import json
import os
import socket
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory

from playwright.sync_api import expect, sync_playwright

state = {'requests': [], 'stored': {}, 'lose_ack': True}


class Upstream(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def reply(self, code, data):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def do_GET(self):
        self.reply(200, {'success': True, 'views': 0})

    def do_POST(self):
        if self.path != '/wp-json/ascentia/v1/contact':
            self.reply(503, {'message': 'No analytics writes during test'})
            return
        payload = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        state['requests'].append(payload)
        key = payload['submission_id']
        if key not in state['stored']:
            state['stored'][key] = payload
        if state['lose_ack']:
            state['lose_ack'] = False
            self.reply(503, {'message': 'Saved, but acknowledgment lost. Retry safely.'})
        else:
            self.reply(200, {'success': True, 'message': 'Already received', 'id': 101, 'duplicate': True})


def available_port():
    with socket.socket() as sock:
        sock.bind(('127.0.0.1', 0))
        return sock.getsockname()[1]


server = ThreadingHTTPServer(('127.0.0.1', 0), Upstream)
threading.Thread(target=server.serve_forever, daemon=True).start()
port = available_port()
with TemporaryDirectory(prefix='ascentia-contact-roundtrip-') as directory:
    log_path = Path(directory) / 'server.log'
    with log_path.open('w', encoding='utf-8') as log:
        process = subprocess.Popen(
            ['node', '.output/server/index.mjs'],
            env={**os.environ, 'NODE_ENV': 'production', 'HOST': '127.0.0.1', 'NITRO_HOST': '127.0.0.1',
                 'PORT': str(port), 'NITRO_PORT': str(port), 'SITE_INDEXABLE': 'false',
                 'WORDPRESS_URL': f'http://127.0.0.1:{server.server_port}'},
            stdout=log, stderr=subprocess.STDOUT,
        )
        try:
            for _ in range(100):
                if process.poll() is not None:
                    raise RuntimeError(log_path.read_text(encoding='utf-8'))
                try:
                    with socket.create_connection(('127.0.0.1', port), timeout=0.2):
                        break
                except OSError:
                    time.sleep(0.1)
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                try:
                    page = browser.new_page(viewport={'width': 390, 'height': 844})
                    errors = []
                    page.on('pageerror', lambda error: errors.append(str(error)))
                    page.goto(f'http://127.0.0.1:{port}/contact-us', wait_until='networkidle')
                    form = page.locator('main form')
                    form.locator('input[name="name"]').fill('Roundtrip test')
                    form.locator('input[name="email"]').fill('roundtrip@example.com')
                    form.locator('textarea').fill('Local in-memory fixture only. No email.')
                    submit = form.get_by_role('button', name='Send enquiry', exact=True)
                    submit.click()
                    expect(form.get_by_role('alert')).to_contain_text('acknowledgment lost', timeout=15000)
                    expect(form.locator('textarea')).to_have_value('Local in-memory fixture only. No email.')
                    assert len(state['requests']) == 1 and len(state['stored']) == 1
                    submit.click()
                    expect(form.get_by_role('status')).to_contain_text('Thank you', timeout=15000)
                    expect(form.locator('textarea')).to_have_value('')
                    assert len(state['requests']) == 2 and len(state['stored']) == 1
                    assert state['requests'][0]['submission_id'] == state['requests'][1]['submission_id']
                    assert not errors, errors
                    print('PASS browser -> production server function -> HTTP upstream -> UI; lost acknowledgment retry keeps same ID; one simulated stored inquiry. No real WordPress write or email.')
                finally:
                    browser.close()
        finally:
            process.terminate()
            process.wait(timeout=10)
            server.shutdown()
            server.server_close()
