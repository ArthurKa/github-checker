#!/bin/bash

shopt -s expand_aliases
source ~/.bashrc
source <(grep '^alias ' ~/.bashrc)
set -e

devUp() {
  dc --env-file .env.defaults --env-file .env --profile dev up -d
}
devDown() {
  dc --env-file .env.defaults --env-file .env --profile dev down
}
testUp() {
  dc --env-file .env.defaults --env-file .env.test --profile test up -d
}
testDown() {
  dc --env-file .env.defaults --env-file .env.test --profile test down
}
devRestart() {
  ./do devDown
  ./do devUp
}
prodBuild() {
  dc --profile prod build
}
prodUp() {
  dc --profile prod up -d
}

# Run function with name provided in $1
set +x
if [ "$1" != "" ]; then
  command="$(echo $1|tr '-' '_')"
  shift
else command="default"; fi
if (type "$command" >/dev/null 2>&1) && \
  [ "$(echo $command | cut -c -1)" != "_" ]; then
  set -x
  $command "$@"
else
  echo "Command \"$command\" not found."
  exit 1
fi
