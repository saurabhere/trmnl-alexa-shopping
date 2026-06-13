#!/usr/bin/env python3
"""Sync the Alexa shopping list (via Bring!) to a TRMNL private plugin.

Two modes:
  * one-shot (default): fetch once, push if changed, exit. Use this from cron /
    GitHub Actions.
  * --watch: loop forever, polling Bring! every --interval seconds and pushing
    to TRMNL the instant the list changes. Use this on an always-on box (or
    locally) when you want the freshest possible server-side state.

Config comes from environment variables (see .env.example):
  BRING_EMAIL, BRING_PASSWORD        -- your Bring! account
  BRING_LIST_NAME (optional)         -- which list; default = account default
  BRING_COUNTRY (optional, US)       -- locale for the Bring API
  TRMNL_PLUGIN_UUID                  -- from your TRMNL private plugin
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
from datetime import datetime, timezone

from bring_client import BringClient, BringError
import trmnl_client

STATE_FILE = os.path.join(os.path.dirname(__file__), ".last_state")


def _env(name: str, default: str | None = None, required: bool = False) -> str | None:
    val = os.environ.get(name, default)
    if required and not val:
        sys.exit(f"Missing required env var: {name}")
    return val


def build_payload(items) -> dict:
    """Shape the merge_variables consumed by template.liquid."""
    return {
        "items": [{"name": i.name, "specification": i.specification, "display": i.display} for i in items],
        "count": len(items),
        "updated_at": datetime.now(timezone.utc).strftime("%b %d, %H:%M UTC"),
        # NB: don't name this "empty" -- that's a reserved keyword in Liquid.
        "is_empty": len(items) == 0,
    }


def fingerprint(items) -> str:
    """Stable hash of the list contents, so we only push on real changes."""
    payload = sorted(i.display for i in items)
    return hashlib.sha256(json.dumps(payload).encode()).hexdigest()


def _read_state() -> str | None:
    try:
        with open(STATE_FILE) as fh:
            return fh.read().strip()
    except FileNotFoundError:
        return None


def _write_state(fp: str) -> None:
    with open(STATE_FILE, "w") as fh:
        fh.write(fp)


def sync_once(client: BringClient, list_name: str | None, plugin_uuid: str, force: bool = False) -> bool:
    """Fetch + push if changed. Returns True if a push happened."""
    items = client.fetch(list_name)
    fp = fingerprint(items)
    if not force and fp == _read_state():
        print(f"[{datetime.now():%H:%M:%S}] no change ({len(items)} items) -- skip push")
        return False
    trmnl_client.push(plugin_uuid, build_payload(items))
    _write_state(fp)
    print(f"[{datetime.now():%H:%M:%S}] pushed {len(items)} item(s) to TRMNL")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--watch", action="store_true", help="loop forever, polling Bring!")
    parser.add_argument("--interval", type=int, default=30, help="poll seconds in --watch mode")
    parser.add_argument("--force", action="store_true", help="push even if unchanged")
    args = parser.parse_args()

    email = _env("BRING_EMAIL", required=True)
    password = _env("BRING_PASSWORD", required=True)
    list_name = _env("BRING_LIST_NAME")
    country = _env("BRING_COUNTRY", "US")
    plugin_uuid = _env("TRMNL_PLUGIN_UUID", required=True)

    client = BringClient(email, password, country=country)

    if not args.watch:
        sync_once(client, list_name, plugin_uuid, force=args.force)
        return

    print(f"watch mode: polling Bring! every {args.interval}s (Ctrl-C to stop)")
    first = True
    while True:
        try:
            sync_once(client, list_name, plugin_uuid, force=args.force and first)
            first = False
        except BringError as exc:
            # token likely expired -> drop client state so next loop re-logs in.
            print(f"bring error: {exc} -- re-authenticating next cycle")
            client = BringClient(email, password, country=country)
        except Exception as exc:  # keep the watcher alive on transient errors
            print(f"transient error: {exc}")
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
