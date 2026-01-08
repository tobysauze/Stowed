# Cloudflare Tunnel setup (Pi hosts the app, accessible via your domain)

This publishes your Pi-hosted web app to the internet securely over HTTPS **without** port-forwarding.

Recommended hostname: **`inventory.promptedbytoby.co.uk`**
*(You can also use the apex `promptedbytoby.co.uk`, but using a subdomain is cleaner.)*

---

## 1) Add your domain to Cloudflare

1. Create/login to your Cloudflare account
2. Add site: `promptedbytoby.co.uk`
3. Cloudflare will give you **nameservers**
4. Go to your domain registrar and change your domain’s nameservers to Cloudflare’s
5. Wait until Cloudflare shows the domain as **Active**

---

## 2) Install the app on the Pi and run it locally

Your Next.js app should run locally first (LAN):

```bash
cd ~/yachtops
npm ci
npm run build
npm run start -- -p 3000 -H 0.0.0.0
```

Confirm on the Pi:

```bash
curl -I http://localhost:3000
```

Stop it (Ctrl+C) once confirmed, then you can run it via systemd later.

---

## 3) Install `cloudflared` on Pi OS Lite 64-bit

```bash
sudo apt update
sudo apt install -y cloudflared
cloudflared --version
```

If `apt` doesn’t have it for your distro, use Cloudflare’s official install method. (Tell me if you hit that and I’ll give the exact commands for your Pi OS release.)

---

## 4) Authenticate `cloudflared` with Cloudflare

Run:

```bash
cloudflared tunnel login
```

It will print a URL. Open it on your laptop, log in to Cloudflare, and approve.

---

## 5) Create the tunnel

Pick a tunnel name:

```bash
cloudflared tunnel create yachtops
```

This creates credentials on the Pi and a tunnel in Cloudflare.

---

## 6) Create DNS route for your hostname

Create a DNS record that points the hostname to your tunnel:

```bash
cloudflared tunnel route dns yachtops inventory.promptedbytoby.co.uk
```

---

## 7) Configure the tunnel to forward to your local app

Create the config file:

```bash
sudo mkdir -p /etc/cloudflared
sudo tee /etc/cloudflared/config.yml > /dev/null << 'EOF'
tunnel: yachtops
credentials-file: /home/pi/.cloudflared/$(ls /home/pi/.cloudflared | grep -E '^[0-9a-f-]+\\.json$' | head -n 1)

ingress:
  - hostname: inventory.promptedbytoby.co.uk
    service: http://localhost:3000
  - service: http_status:404
EOF
```

**Note:** that `credentials-file` line auto-picks the first tunnel JSON in `/home/pi/.cloudflared/`.

---

## 8) Run both services via systemd (recommended)

### 8a) App service (Next.js)

Copy `ops/systemd-yachtops.service` to systemd and adjust the path if needed:

```bash
sudo cp ~/yachtops/ops/systemd-yachtops.service /etc/systemd/system/yachtops.service
sudo systemctl daemon-reload
sudo systemctl enable yachtops
sudo systemctl start yachtops
sudo systemctl status yachtops --no-pager
```

### 8b) Cloudflare tunnel service

Install the tunnel as a service:

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl restart cloudflared
sudo systemctl status cloudflared --no-pager
```

---

## 9) Test it

Open:
- `https://inventory.promptedbytoby.co.uk`

---

## Critical security note (please read)

Before you invite real users, we must:
- implement **local authentication + roles**, and
- ensure the app does **not** expose admin actions publicly.

Cloudflare Tunnel secures transport (HTTPS), but you still need **login + authorization** at the application layer.


