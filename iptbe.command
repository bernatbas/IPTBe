#!/bin/bash
# IPTBe — doble clic per obrir el gestor.
cd "$(dirname "$0")" || exit 1

if ! command -v python3 >/dev/null 2>&1; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " IPTBe necessita Python 3.7 o superior."
  echo " No el trobo instal·lat en aquest Mac."
  echo ""
  echo " Com instal·lar-lo:"
  echo "   xcode-select --install"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  read -r -p "Premeu Enter per tancar."
  exit 1
fi

py_ver=$(python3 -c "import sys; print(sys.version_info[:2] >= (3,7))" 2>/dev/null)
if [ "$py_ver" != "True" ]; then
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " IPTBe necessita Python 3.7 o superior."
  py_actual=$(python3 --version 2>&1)
  echo " Versió actual: $py_actual"
  echo ""
  echo " Actualitza Python des de:"
  echo "   https://www.python.org/downloads/"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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
