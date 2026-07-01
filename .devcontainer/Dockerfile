# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/typescript-node:4-24-trixie

# OpenCode
RUN npm install -g opencode-ai@latest

# Agent Browser
ENV AGENT_BROWSER_ENGINE=lightpanda
ENV LIGHTPANDA_DIR=/usr/local/bin
ENV LIGHTPANDA_EXECUTABLE_PATH=${LIGHTPANDA_DIR}/lightpanda
RUN curl -fsSL https://pkg.lightpanda.io/install.sh | bash

RUN npm install -g agent-browser skills

RUN npx skills add vercel-labs/agent-browser --skill agent-browser dogfood --global --yes

# Dev server helper
RUN apt-get update && apt-get install -y tmux && apt-get clean

WORKDIR /workspace
