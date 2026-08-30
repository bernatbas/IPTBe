#!/bin/bash
# IPTBe — doble clic per obrir el gestor.
cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "No trobo python3 en aquest Mac."
  echo "Instal·la les eines de línia d'ordres amb:  xcode-select --install"
  echo ""
  read -r -p "Premeu Enter per tancar."
  exit 1
fi

clear 2>/dev/null || true
python3 -u server.py       # -u: la sortida apareix a l'instant, sense esperar
status=$?

echo ""
if [ $status -ne 0 ]; then
  echo "El servidor s'ha aturat amb un error (codi $status)."
  echo ""
  read -r -p "Premeu Enter per tancar aquesta finestra."
fi
