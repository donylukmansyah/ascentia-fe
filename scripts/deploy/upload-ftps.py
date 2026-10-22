import os
import re
import ssl
from ftplib import FTP_TLS
from io import BytesIO
from pathlib import Path


def release_files(directory):
    root = Path(directory)
    required = ('.output/server/index.mjs', '.output/public', 'app.js', 'package.json')
    if not root.is_dir() or any(not (root / name).exists() for name in required):
        raise ValueError('Incomplete Node release')
    if {item.name for item in root.iterdir()} != {'.output', 'app.js', 'package.json'}:
        raise ValueError('Release must contain only .output, app.js and package.json')
    files = []
    for path in sorted(root.rglob('*')):
        relative = path.relative_to(root).as_posix()
        if path.is_symlink() or any(char in relative for char in '\r\n\\'):
            raise ValueError('Unsafe release path')
        if path.name.startswith('.env'):
            raise ValueError('Environment files must not be uploaded')
        if path.is_file():
            files.append((path, relative))
    return files


def upload(directory, release_id, host, username, password, factory=FTP_TLS):
    if not re.fullmatch(r'[0-9]+-[0-9]+-[a-f0-9]{12}', release_id):
        raise ValueError('Invalid release ID')
    if not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?', host):
        raise ValueError('FTP_SERVER must be a hostname, without scheme or path')
    if not username or not password or any(char in username + password for char in '\r\n'):
        raise ValueError('Missing or invalid FTP credentials')
    files = release_files(directory)
    context = ssl.create_default_context()
    context.minimum_version = ssl.TLSVersion.TLSv1_2
    with factory(context=context, timeout=60) as ftp:
        ftp.connect(host, 21)
        ftp.login(username, password)
        ftp.prot_p()
        root = ftp.pwd().replace('\\', '/').lower()
        if 'public_html' in root.split('/'):
            raise ValueError('Refusing deployment into public_html')
        names = {name.rstrip('/').split('/')[-1].lower() for name in ftp.nlst()}
        if names.intersection({'wp-admin', 'wp-content', 'wp-includes', 'wp-config.php', 'public_html'}) or any(name.startswith('cms.') for name in names):
            raise ValueError('FTP root contains WordPress or public directories')
        if 'releases' not in names:
            ftp.mkd('releases')
        ftp.cwd('releases')
        ftp.mkd(release_id)
        ftp.cwd(release_id)
        created = set()
        for path, relative in files:
            parts = relative.split('/')[:-1]
            for index in range(1, len(parts) + 1):
                parent = '/'.join(parts[:index])
                if parent not in created:
                    ftp.mkd(parent)
                    created.add(parent)
            with path.open('rb') as stream:
                ftp.storbinary('STOR ' + relative, stream)
            if ftp.size(relative) != path.stat().st_size:
                raise RuntimeError('Remote file size mismatch: ' + relative)
        marker = b'All release files uploaded and size-checked. Not activated.\n'
        ftp.storbinary('STOR RELEASE_READY', BytesIO(marker))
        if ftp.size('RELEASE_READY') != len(marker):
            raise RuntimeError('Release completion marker verification failed')
    return f'releases/{release_id}'


if __name__ == '__main__':
    path = upload(
        'release',
        os.environ['RELEASE_ID'],
        os.environ['FTP_SERVER'],
        os.environ['FTP_USERNAME'],
        os.environ['FTP_PASSWORD'],
    )
    print(f'Uploaded {path}. No application restarted or activated.')
