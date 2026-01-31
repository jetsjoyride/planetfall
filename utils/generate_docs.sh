#!/bin/bash
# Compile .mmd files to docs/images
mkdir -p docs/images
npx -y @mermaid-js/mermaid-cli -i docs/*.mmd -o docs/images
