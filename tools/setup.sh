#!/usr/bin/env bash
# Installe l'outil de détourage (le modèle rembg est bloqué dans le conteneur, celui-ci vient de npm).
set -e
mkdir -p /tmp/lb-tools && cd /tmp/lb-tools
[ -f package.json ] || echo '{"name":"lb-tools","private":true,"overrides":{"sharp":"0.33.5"}}' > package.json
[ -d node_modules/@imgly/background-removal-node ] || npm install @imgly/background-removal-node@1.4.5 --no-audit --no-fund --silent
python3 -c "import cv2" 2>/dev/null || pip install --break-system-packages -q "opencv-python-headless<5"
python3 -c "import playwright, PIL, cv2" && echo "setup ok"
