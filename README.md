# DeFi Research MCP Server

MCP server for DeFi token research. Get gas prices, token prices, liquidity data, and deep research — all via natural language through MCP.

## Tools

| Tool | Description | Cost |
|---|---|---|
| `get_gas_prices` | Current Ethereum gas prices | Free |
| `get_token_price` | USD price, 24h change, market cap | 1 credit |
| `get_token_research` | Deep research: price, description, categories, rank, links | 3 credits |
| `get_liquidity_data` | DEX liquidity across top pairs | 2 credits |

## Setup

### 1. Get an API key

Buy 100 credits for $10 at:

https://extant-torrie-nonrepealable.ngrok-free.dev/buy

### 2. Configure

**Claude Desktop** — add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "defi-research": {
      "command": "npx",
      "args": ["-y", "github:KennyWayn3/defi-research-mcp"],
      "env": {
        "DEFI_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**Other MCP clients** — run directly:

```bash
DEFI_API_KEY=your_key_here node src/index.js
```

### 3. Use it

Ask your AI agent:

- "What are current gas prices?"
- "What's the price of bitcoin?"
- "Research ethereum deeply"
- "Check liquidity for USDC on DEXs"

## Self-hosting

The MCP server calls a hosted API by default. You can point it at your own instance:

```json
{
  "env": {
    "DEFI_API_KEY": "your_key",
    "DEFI_API_URL": "http://localhost:3456"
  }
}
```

## License

MIT
