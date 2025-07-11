#!/bin/bash
set -e

cd app
bun run build

cd ../entry
bun run build

mkdir -p ../dist
cp ./dist/index.js ../dist/index.js
cp ./dist/index.css ../dist/index.css
cp ./src/index.d.ts ../dist/index.d.ts