#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
    echo "USAGE: $0 ROLL_SPEC"
    exit 1
fi

SCRIPT_DIR="$(
    cd "$(dirname "${BASH_SOURCE[0]}")"
    pwd -P
)"

cd "$SCRIPT_DIR/src"

ts-node 4< <(printf "%s" "$1") << EOM
import {Dice} from ".";
import {inspect} from "util";
import {readFileSync} from "fs";

// Reads from file descriptor 4
const rollSpec = readFileSync(4).toString();

console.log(inspect((new Dice()).roll(rollSpec), false, null))
EOM
