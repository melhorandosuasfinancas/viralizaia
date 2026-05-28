#!/bin/bash
# Inicia servidor bgutil (gerador de PO tokens para yt-dlp bypassar detecção de bots)
echo "[bgutil] Iniciando servidor de PO tokens na porta 4416..."
node /bgutil/server/build/main.js &
BGUTIL_PID=$!

# Aguarda o servidor bgutil inicializar
sleep 4
if kill -0 $BGUTIL_PID 2>/dev/null; then
    echo "[bgutil] Servidor iniciado com sucesso (PID: $BGUTIL_PID)"
else
    echo "[bgutil] AVISO: Servidor bgutil nao iniciou corretamente"
fi

# Inicia backend principal
echo "[app] Iniciando ViralizaIA Backend..."
exec node /app/server.js
