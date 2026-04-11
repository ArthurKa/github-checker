# GitHub Checker

## How to run

### Certificates

```bash
mkcert \
  -cert-file mkcert/github-checker-cert.pem \
  -key-file mkcert/github-checker-cert-key.pem \
  github-checker.arthurka-localhost.com
```

`/etc/hosts` (or `C:/Windows/System32/drivers/etc/hosts`):

```bash
127.0.0.1 github-checker.arthurka-localhost.com
```

```bash
npm run api:dev
```

## Entrypoints

### Local

<https://github-checker.arthurka-localhost.com>

### Production

<https://github-checker.arthurka.com>

## Production deployment

```bash
cd ~/github-checker &&
git checkout master &&
git fetch &&
git reset --hard origin/master &&
./do prodBuild &&
./do prodUp &&
docker restart nginx-certbot &&
docker image prune -f &&
docker builder prune -f --keep-storage 3GB &&
exit
```

## Some notes

- repos are tracked by their ID so repo renaming or other should not affect the app like it could with accessing by name
- any repo access change such as removing, hiding as private, etc, is handled in the app but not for the end user
- if repo is renamed the app also updates this info
- the latest repo release for the app is the first element from array by `/releases` GitHub API, not `/releases/latest`
- release tag is tracked only by `tag_name` property and only the latest one so the app will detect any renaming, unpublish, etc as latest tag change and will send an email notification
- I don't see 429 Too Many Requests from GitHub as it's specified in the requirement so the app handles only 403 Forbidden the real GitHub response for this case
- instead of GitHub Action CI on push linter + tests configured linter + tests + types + some extra checks on Git pre-commit hook
