import importlib.util
import ssl
from pathlib import Path
from tempfile import TemporaryDirectory

spec = importlib.util.spec_from_file_location('upload_ftps', Path(__file__).parents[1] / 'deploy/upload-ftps.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class FakeFTP:
    def __init__(self, root='/', names=(), conflict=False, fail=False, wrong_size=False):
        self.root = root
        self.names = names
        self.conflict = conflict
        self.fail = fail
        self.wrong_size = wrong_size
        self.paths = []
        self.uploaded = {}
        self.protected = False

    def __call__(self, **kwargs):
        assert kwargs['context'].verify_mode == ssl.CERT_REQUIRED
        assert kwargs['context'].check_hostname
        assert kwargs['context'].minimum_version >= ssl.TLSVersion.TLSv1_2
        return self

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass

    def connect(self, host, port):
        assert host == 'ftp.example.com' and port == 21

    def login(self, username, password):
        assert username == 'deployer' and password == 'test-only'

    def prot_p(self):
        self.protected = True

    def pwd(self):
        return self.root

    def nlst(self):
        return self.names

    def mkd(self, path):
        if self.conflict and path == release_id:
            raise RuntimeError('Directory exists')
        self.paths.append(path)

    def cwd(self, path):
        assert path in ('releases', release_id)

    def storbinary(self, command, stream):
        assert self.protected
        if self.fail:
            raise RuntimeError('Transfer failed')
        self.uploaded[command.removeprefix('STOR ')] = stream.read()

    def size(self, path):
        return len(self.uploaded[path]) + int(self.wrong_size)


def rejected(callback, error=ValueError):
    try:
        callback()
    except error:
        return
    raise AssertionError('Unsafe or failed upload was accepted')


release_id = '123-1-abcdef123456'
with TemporaryDirectory() as directory:
    root = Path(directory)
    for path in ('.output/server/index.mjs', '.output/public/assets/app.js', '.output/public/assets/app.js.br', 'app.js', 'package.json'):
        target = root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(b'fixture content')

    def send(ftp, **kwargs):
        return module.upload(root, release_id, kwargs.get('host', 'ftp.example.com'), 'deployer', 'test-only', factory=ftp)

    ftp = FakeFTP()
    assert send(ftp) == 'releases/' + release_id
    assert list(ftp.uploaded)[-1] == 'RELEASE_READY'
    assert '.output/public/assets/app.js.br' in ftp.uploaded
    assert ftp.uploaded['app.js'] == b'fixture content'

    for ftp in (FakeFTP(root='/home/user/public_html'), FakeFTP(names=['wp-admin']), FakeFTP(names=['wp-config.php']), FakeFTP(names=['cms.example.com']), FakeFTP(names=['public_html'])):
        rejected(lambda: send(ftp))
        assert not ftp.uploaded
    rejected(lambda: send(FakeFTP(), host='ftp://example.com'))
    rejected(lambda: module.upload(root, '../escape', 'ftp.example.com', 'deployer', 'test-only', factory=FakeFTP()))
    rejected(lambda: send(FakeFTP(conflict=True)), RuntimeError)
    for ftp in (FakeFTP(fail=True), FakeFTP(wrong_size=True)):
        rejected(lambda: send(ftp), RuntimeError)
        assert 'RELEASE_READY' not in ftp.uploaded
    for name in ('.env', 'wp-config.php'):
        (root / name).write_bytes(b'forbidden')
        rejected(lambda: send(FakeFTP()))
        (root / name).unlink()
    (root / '.output/.env').write_bytes(b'forbidden')
    rejected(lambda: send(FakeFTP()))
    (root / '.output/.env').unlink()
    (root / 'app.js').unlink()
    rejected(lambda: send(FakeFTP()))

print('PASS FTPS: TLS validation, encrypted data, release layout, unsafe root rejection, unique release, failure marker, required files, no secrets included. No network connection.')
