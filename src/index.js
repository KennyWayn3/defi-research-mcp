#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import https from "https";
import http from "http";

const API_KEY = process.env.DEFI_API_KEY || "";
const API_URL = (process.env.DEFI_API_URL || "https://extant-torrie-nonrepealable.ngrok-free.dev").replace(/\/+$/, "");

if (!API_KEY) {
  console.error("DEFI_API_KEY not set. Get one at " + API_URL + "/buy");
  process.exit(1);
}

function apiPost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const u = new URL(path, API_URL);
    const mod = u.protocol === "https:" ? https : http;
    const opts = {
      hostname: u.hostname, port: u.port, path: u.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = mod.request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          reject(new Error(`Invalid response: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

function apiGet(path) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, API_URL);
    const mod = u.protocol === "https:" ? https : http;
    mod.get(u.href, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          reject(new Error(`Invalid response: ${data.slice(0, 200)}`));
        }
      });
    }).on("error", reject);
  });
}

function formatResult(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function formatError(msg) {
  return { content: [{ type: "text", text: `Error: ${msg}` }], isError: true };
}

const server = new McpServer({
  name: "DeFi Research MCP",
  version: "1.0.0",
});

server.tool(
  "get_gas_prices",
  "Get current Ethereum gas prices (free, no API key needed)",
  {},
  async () => {
    try {
      const { body } = await apiGet("/api/defi/gas");
      return formatResult(body);
    } catch (e) {
      return formatError(e.message);
    }
  },
);

server.tool(
  "get_token_price",
  "Get current USD price, 24h change, and market cap for any cryptocurrency token. Costs 1 credit.",
  {
    token: z.string().describe("Token name (e.g. bitcoin, ethereum, solana)"),
  },
  async ({ token }) => {
    try {
      const { status, body } = await apiPost("/api/defi/price", {
        api_key: API_KEY,
        token: token.toLowerCase(),
      });
      if (status === 402) return formatError(`Insufficient credits. Buy more at ${API_URL}/buy`);
      if (status === 401) return formatError("Invalid API key. Get one at " + API_URL + "/buy");
      return formatResult(body);
    } catch (e) {
      return formatError(e.message);
    }
  },
);

server.tool(
  "get_token_research",
  "Get deep research on a token including price, description, categories, rank, and links. Costs 3 credits.",
  {
    token: z.string().describe("Token name (e.g. bitcoin, ethereum, solana)"),
  },
  async ({ token }) => {
    try {
      const { status, body } = await apiPost("/api/defi/research", {
        api_key: API_KEY,
        token: token.toLowerCase(),
      });
      if (status === 402) return formatError(`Insufficient credits. Buy more at ${API_URL}/buy`);
      if (status === 401) return formatError("Invalid API key. Get one at " + API_URL + "/buy");
      return formatResult(body);
    } catch (e) {
      return formatError(e.message);
    }
  },
);

server.tool(
  "get_liquidity_data",
  "Get DEX liquidity data for a token across top pairs. Costs 2 credits.",
  {
    token: z.string().describe("Token symbol or name (e.g. USDC, ETH, SOL)"),
  },
  async ({ token }) => {
    try {
      const { status, body } = await apiPost("/api/defi/liquidity", {
        api_key: API_KEY,
        token,
      });
      if (status === 402) return formatError(`Insufficient credits. Buy more at ${API_URL}/buy`);
      if (status === 401) return formatError("Invalid API key. Get one at " + API_URL + "/buy");
      return formatResult(body);
    } catch (e) {
      return formatError(e.message);
    }
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
