# `h-group-helper`

## Intro

`h-group-helper` is a [Discord](https://discord.com/) bot written in [TypeScript](https://www.typescriptlang.org/).

It is used to automatically create and remove voice channels.

## Installation

```sh
npm install pm2 -g
pm2 startup
pm2 start "/root/h-group-helper/dist/main.js" --name h-group-helper --merge-logs --log="/root/h-group-helper/logs/h-group-helper.log"
pm2 save
```
