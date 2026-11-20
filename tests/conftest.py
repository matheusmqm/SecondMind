"""Configuração compartilhada: roda uma vez antes de todos os testes.

`get_settings()` exige chaves do Supabase e da Anthropic. Aqui damos valores FALSOS
por variável de ambiente (elas têm prioridade sobre o .env), então os testes nunca
leem as suas chaves reais e nunca falam com a rede.
"""

import os

os.environ["SUPABASE_URL"] = "https://teste.supabase.co"
os.environ["SUPABASE_SERVICE_ROLE_KEY"] = "chave-falsa"
os.environ["ANTHROPIC_API_KEY"] = "chave-falsa"

# Limite pequeno de linhas, para o teste de "resultado cortado" ficar curto e claro.
os.environ["SQL_MAX_ROWS"] = "5"
