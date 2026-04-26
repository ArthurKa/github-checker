# GitHub Checker

## How to run

0. Preinstalls:
    - on Windows recommended to do once and forget for ever `git config --global core.autocrlf false` (or `git config core.autocrlf false` after `1. git clone` if you don't want to configure it once globally).
    - install ESLint VS Code extension (<https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint>)
    - make sure VS Code is using correct TypeScript version from `node_modules` local folder and not globally installed version
1. Clone this repo.
2. Make sure you are using correct versions of Node.js(`.nvmrc`) and TypeScript(`node_modules`).
3. `npm ci` to install all dependencies.
4. OPTIONAL: Create a `.env` file in the root directory to override specific values from `.env.defaults`.
5. `./do devUp` to run project dependencies.

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

## Nice to know

### `.env` files structure

`.env.defaults` file goes with Git and contains full list of env variables with their valid default values. \
`.env` file is Git-ignored and contains local env overrides applied on `.env.defaults` in dev mode. \
`.env.test` file goes with Git and contains overrides applied on `.env.defaults` in testing mode.

## Entrypoints

### Local

<https://github-checker.arthurka-localhost.com>

### Production

<https://github-checker.arthurka.com>

## Production deployment

```bash
cd ~/github-checker &&
git checkout master &&
git fetch -f &&
git reset --hard origin/master &&
./do prodBuild &&
./do prodUp &&
docker restart nginx-certbot &&
docker image prune -f &&
docker builder prune -f --keep-storage 3GB &&
exit
```

## Some notes

- Repos are tracked by their ID so repo renaming or other should not affect the app like it could with accessing by name
- Any repo access change such as removing, hiding as private, etc, is handled in the app but not for the end user
- If repo is renamed the app also updates this info
- The latest repo release for the app is the first element from array by `/releases` GitHub API, not `/releases/latest`
- Release tag is tracked only by `tag_name` property and only the latest one so the app will detect any renaming, unpublish, etc as latest tag change and will send an email notification

The app live status page can be found here: <https://up.arthurka.com/status/github-checker>.
