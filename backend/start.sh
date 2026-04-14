#!/bin/bash
# Lance le backend RdvFacile en mode développement (H2 en mémoire)
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================="
echo "  RdvFacile Backend — profil DEV (H2)   "
echo "========================================="
echo ""
echo "  API  : http://localhost:8080/api"
echo "  H2   : http://localhost:8080/api/h2-console"
echo "         JDBC URL : jdbc:h2:mem:rdvfacile"
echo "         User     : sa  / Password : (vide)"
echo ""
echo "-----------------------------------------"

mvn spring-boot:run -Dspring-boot.run.profiles=dev
