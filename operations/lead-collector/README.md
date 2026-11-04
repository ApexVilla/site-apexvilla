# Coletor de leads

Serviço Node, sem dependências, que recebe o formulário do site em `POST /api/lead`
e responde `GET /health`.

| Variável | Para quê | Padrão |
|---|---|---|
| `PORT` | porta do serviço | `8099` |
| `HOST` | interface | `0.0.0.0` |
| `LEADS_FILE` | arquivo de destino | `/data/leads.jsonl` |
| `PUBLIC_ORIGIN` | origem aceita | `https://apexvilla.com.br` |
| `TRUSTED_PROXY_IPS` | proxies confiáveis, por IP ou CIDR | nenhum |

Teste: `node --test storage.test.mjs`
