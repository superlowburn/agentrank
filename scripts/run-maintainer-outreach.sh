#!/bin/bash
cd /Users/mallett/claude/AgentRank
/opt/homebrew/bin/npx tsx scripts/tweet-bot.ts --type maintainer-outreach --now >> /Users/mallett/claude/AgentRank/logs/maintainer-campaign.log 2>&1
