#!/bin/bash
cd /Users/mallett/claude/AgentRank
/opt/homebrew/bin/npx tsx scripts/tweet-bot.ts --type top10 --now >> /Users/mallett/claude/AgentRank/logs/weekly-tweet.log 2>&1
