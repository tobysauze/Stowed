# Deploying YachtOps on a Raspberry Pi (Pi OS Lite 64-bit)

Your Next.js app can run on a Raspberry Pi and be accessed remotely. **Important detail:** the app uses **Supabase** for the database/auth, so the Pi hosts the web UI, but your data lives in Supabase.

## 0) Security warning (do this before going public)

Right now you have a dev migration `supabase/migrations/002_dev_rls_policies.sql` that allows open access.

- **Do not expose the app publicly with dev RLS enabled.**
- Before “users can log in from anywhere”, we should implement **Supabase Auth + proper RLS** (this is already on our TODO).

## 1) Install prerequisites on the Pi

Update packages:

```bash
sudo apt update && sudo apt upgrade -y
```

Install git + build tools:

```bash
sudo apt install -y git build-essential
```

Install Node.js 20 (recommended) via NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 2) Copy the project to the Pi

If you’re using git, clone it:

```bash
git clone <your-repo-url> yachtops
cd yachtops
```

If not using git, copy the folder to the Pi (SCP, SFTP, etc.) and `cd` into it.

## 3) Configure environment variables

Create `.env.local` on the Pi:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF
```

## 4) Install deps and build

```bash
npm ci
npm run build
```

## 5) Run in production mode

For a quick test:

```bash
npm run start -- -p 3000 -H 0.0.0.0
```

From another machine on the same network:
- `http://<pi-lan-ip>:3000`

## 6) Keep it running (systemd service)

Create a service file:

```bash
sudo tee /etc/systemd/system/yachtops.service > /dev/null << 'EOF'
[Unit]
Description=YachtOps Inventory (Next.js)
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/yachtops
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run start -- -p 3000 -H 0.0.0.0
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
```

Enable + start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable yachtops
sudo systemctl start yachtops
sudo systemctl status yachtops --no-pager
```

## 7) Access “from anywhere”

You have 3 realistic options:

### Option A (recommended): Cloudflare Tunnel (no router port forwarding)
- Easy, secure, HTTPS, works behind NAT.
- Requires a Cloudflare account and a domain (you have `promptedbytoby.co.uk` ✅).
- See `ops/cloudflare-tunnel.md` for copy/paste steps.

### Option B: Tailscale (private access only)
- Fastest setup.
- Only devices on your Tailnet can access it (great for crew).

### Option C: Port forwarding + DNS (public internet)
- Exposes your Pi to the internet; more risk and maintenance.
- You must do SSL (nginx + Let’s Encrypt) and harden the Pi.

## 8) Reverse proxy (optional but typical)

If you want pretty URLs/SSL/headers, run nginx on the Pi and proxy to `localhost:3000`.

---

If you tell me which remote-access option you want (Cloudflare Tunnel / Tailscale / Port-forwarding), I’ll add the exact step-by-step commands for that setup too.


