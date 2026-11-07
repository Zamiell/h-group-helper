# `h-group-helper`

## Intro

`h-group-helper` is a [Discord](https://discord.com/) bot written in
[TypeScript](https://www.typescriptlang.org/).

It is used to automatically create and remove voice channels.

## Installation

Run these as root to run the bot as the unprivileged `hanabi` user:

```sh
# Clone the repository and install Bun and the dependencies as the "hanabi" user.
git clone https://github.com/Zamiell/h-group-helper.git /home/hanabi/h-group-helper
chown -R hanabi:hanabi /home/hanabi/h-group-helper
runuser -u hanabi -- env HOME=/home/hanabi bash -c "curl -fsSL https://bun.sh/install | bash"
runuser -u hanabi -- env HOME=/home/hanabi bash -c "cd ~/h-group-helper && ~/.bun/bin/bun install --frozen-lockfile --ignore-scripts"

# Fill in the values from ".env.example".
install -m 600 -o hanabi -g hanabi /home/hanabi/h-group-helper/.env.example /home/hanabi/h-group-helper/.env
nano /home/hanabi/h-group-helper/.env

# Create and start the service.
cat > /etc/systemd/system/h-group-helper.service << 'EOF'
[Unit]
Description=H-Group Helper Discord bot
After=network-online.target
Wants=network-online.target

[Service]
User=hanabi
Group=hanabi
WorkingDirectory=/home/hanabi/h-group-helper
ExecStart=/home/hanabi/.bun/bin/bun run ./src/main.ts
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/home/hanabi/.bun

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now h-group-helper
```

View the logs with `journalctl --unit=h-group-helper`.

To update to the latest version:

```sh
runuser -u hanabi -- env HOME=/home/hanabi bash -c "cd ~/h-group-helper && git pull && ~/.bun/bin/bun install --frozen-lockfile --ignore-scripts"
systemctl restart h-group-helper
```
