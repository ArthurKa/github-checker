#!/bin/sh
# vim:sw=4:ts=4:et

set -e

echo  ======================================================= CONTAINER STATED =======================================================

cd /etc/nginx/conf.d
echo Removing all existed links in $(pwd).
for file in $(ls -A); do
    if [ -L $file ]; then
        rm $file
    fi
done

echo Linking config files:
cd /nginx-volumes
for project in $(ls); do
    cd $project
    for file in $(ls -A); do
        echo $(pwd)/$file → /etc/nginx/conf.d/${project}_$file
        ln -sf $(pwd)/$file /etc/nginx/conf.d/${project}_$file
    done
    cd ..
done
cd ..
echo Linking config files done.
echo

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

if echo "$1" | grep -q "nginx"; then
    if /usr/bin/find "/docker-entrypoint.d/" -mindepth 1 -maxdepth 1 -type f -print -quit 2>/dev/null | read v; then
        entrypoint_log "$0: /docker-entrypoint.d/ is not empty, will attempt to perform configuration"

        entrypoint_log "$0: Looking for shell scripts in /docker-entrypoint.d/"
        find "/docker-entrypoint.d/" -follow -type f -print | sort -V | while read -r f; do
            case "$f" in
                *.envsh)
                    if [ -x "$f" ]; then
                        entrypoint_log "$0: Sourcing $f";
                        . "$f"
                    else
                        # warn on shell scripts without exec bit
                        entrypoint_log "$0: Ignoring $f, not executable";
                    fi
                    ;;
                *.sh)
                    if [ -x "$f" ]; then
                        entrypoint_log "$0: Launching $f";
                        "$f"
                    else
                        # warn on shell scripts without exec bit
                        entrypoint_log "$0: Ignoring $f, not executable";
                    fi
                    ;;
                *) entrypoint_log "$0: Ignoring $f";;
            esac
        done

        entrypoint_log "$0: Configuration complete; ready for start up"
    else
        entrypoint_log "$0: No files found in /docker-entrypoint.d/, skipping configuration"
    fi
fi

exec "$@"
