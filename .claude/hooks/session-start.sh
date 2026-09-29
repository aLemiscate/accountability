#!/bin/bash
# SessionStart hook for Claude Code on the web.
# 1. Installs npm dependencies (yaml, diff, playwright).
# 2. Makes headless Chromium trust the session's egress-proxy CA, so capture
#    screenshots and the page watcher's browser fallback work in cloud sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

npm install --no-audit --no-fund --loglevel=error

# Trust the proxy CA in Chromium's NSS store. Without this, every page load in
# the headless browser fails with ERR_CERT_AUTHORITY_INVALID.
CA=/root/.ccr/agent-proxy-ca.crt
NSSDB="$HOME/.pki/nssdb"
if [ -f "$CA" ]; then
  if ! command -v certutil >/dev/null 2>&1; then
    (apt-get install -y -qq libnss3-tools >/dev/null 2>&1 \
      || { apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq libnss3-tools >/dev/null 2>&1; }) \
      || echo "session-start: could not install certutil; browser screenshots may fail" >&2
  fi
  if command -v certutil >/dev/null 2>&1; then
    mkdir -p "$NSSDB"
    [ -f "$NSSDB/cert9.db" ] || certutil -N -d "sql:$NSSDB" --empty-password
    if ! certutil -L -d "sql:$NSSDB" -n ccr-agent-proxy >/dev/null 2>&1; then
      certutil -A -d "sql:$NSSDB" -n ccr-agent-proxy -t "C,," -i "$CA"
    fi
  fi
fi
