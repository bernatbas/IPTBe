#!/usr/bin/env python3
"""IPTBe — gestor IPTV local. Només biblioteca estàndard de Python."""
import calendar, gzip, http.server, json, os, re, socket, socketserver, subprocess, sys
import threading, time, urllib.error, urllib.parse, urllib.request, webbrowser
from xml.etree import ElementTree

ROOT  = os.path.dirname(os.path.abspath(__file__))
APP   = os.path.join(ROOT, "app")
CACHE = os.path.join(ROOT, "cache")
ENV   = os.path.join(ROOT, ".env")

UA            = "VLC/3.0.20 LibVLC/3.0.20"
NET_TIMEOUT   = 25          # segons abans de rendir-nos amb el proveïdor
CATALOG_TTL   = 30*24*3600  # el catàleg es refresca un cop al mes
EPG_TTL       = 30*60       # la guia, cada mitja hora
IDLE_TIMEOUT  = 90          # sense senyals de vida del navegador, el servidor es tanca

os.makedirs(CACHE, exist_ok=True)

# ─────────────────────────── errors amb missatge humà ───────────────────────────

class Upstream(Exception):
    def __init__(self, msg, kind="error", detail=""):
        super().__init__(msg); self.msg, self.kind, self.detail = msg, kind, detail

def _classify(e):
    if isinstance(e, (socket.timeout, TimeoutError)):
        return Upstream("El teu proveïdor no contesta. Pot ser que el seu servidor "
                        "estigui saturat o caigut.", "timeout", str(e))
    if isinstance(e, urllib.error.HTTPError):
        if e.code in (401, 403):
            return Upstream("El proveïdor rebutja les credencials. Revisa usuari i "
                            "contrasenya a Configuració.", "auth", f"HTTP {e.code}")
        return Upstream(f"El proveïdor ha respost amb un error (HTTP {e.code}).",
                        "http", str(e))
    if isinstance(e, urllib.error.URLError):
        r = str(getattr(e, "reason", e))
        if "getaddrinfo" in r or "Name or service" in r or "nodename" in r:
            return Upstream("No trobo aquest servidor. Comprova que l'adreça estigui ben "
                            "escrita, i que tinguis connexió a internet.", "dns", r)
        if "timed out" in r.lower():
            return Upstream("El teu proveïdor no contesta (temps esgotat).", "timeout", r)
        return Upstream(f"No s'ha pogut connectar amb el proveïdor: {r}", "network", r)
    if isinstance(e, (json.JSONDecodeError, ElementTree.ParseError)):
        return Upstream("El proveïdor ha enviat una resposta que no s'entén.",
                        "malformed", str(e))
    return Upstream(f"Error inesperat: {e}", "error", repr(e))

def fetch(url, timeout=NET_TIMEOUT):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Encoding": "gzip"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            data = r.read()
            if r.headers.get("Content-Encoding") == "gzip":
                data = gzip.decompress(data)
            return data
    except Exception as e:
        raise _classify(e) from e

# ─────────────────────────────── credencials ────────────────────────────────────

def read_env():
    if not os.path.exists(ENV): return {}
    out = {}
    for line in open(ENV, encoding="utf-8"):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1); out[k.strip()] = v.strip()
    return out

def write_env(server, user, pw):
    with open(ENV, "w", encoding="utf-8") as f:
        f.write("# IPTBe — credencials del proveïdor. NO compartir.\n")
        f.write(f"IPTV_SERVER={server}\nIPTV_USER={user}\nIPTV_PASS={pw}\n")
    os.chmod(ENV, 0o600)

def creds():
    e = read_env()
    s, u, p = e.get("IPTV_SERVER",""), e.get("IPTV_USER",""), e.get("IPTV_PASS","")
    if not (s and u and p):
        raise Upstream("Encara no has configurat el proveïdor.", "unconfigured")
    return s.rstrip("/"), u, p

def api_url(action=None, base=None, **kw):
    s, u, p = base or creds()
    q = {"username": u, "password": p}
    if action: q["action"] = action
    q.update({k: v for k, v in kw.items() if v is not None})
    return f"{s}/player_api.php?" + urllib.parse.urlencode(q)

def api(action=None, base=None, **kw):
    raw = fetch(api_url(action, base, **kw))
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e:
        raise _classify(e) from e

# ────────────────────────── catàleg amb memòria cau ─────────────────────────────

_lock = threading.Lock()
_mem  = {}

def _cache_path(name): return os.path.join(CACHE, name + ".json")

def _load_cache(name, ttl):
    p = _cache_path(name)
    if not os.path.exists(p): return None
    if time.time() - os.path.getmtime(p) > ttl: return None
    try:
        with open(p, encoding="utf-8") as f: return json.load(f)
    except Exception:
        return None

def _save_cache(name, data):
    tmp = _cache_path(name) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(tmp, _cache_path(name))

KINDS = {
    "live":   ("get_live_streams",  "get_live_categories"),
    "vod":    ("get_vod_streams",   "get_vod_categories"),
    "series": ("get_series",        "get_series_categories"),
}

def _slim(kind, rows):
    out = []
    for x in rows:
        try:
            if kind == "live":
                out.append({"id": int(x["stream_id"]), "n": (x.get("name") or "").strip(),
                            "l": x.get("stream_icon") or "", "c": str(x.get("category_id") or ""),
                            "e": (x.get("epg_channel_id") or "").strip(),
                            "a": 1 if str(x.get("tv_archive")) == "1" else 0})
            elif kind == "vod":
                out.append({"id": int(x["stream_id"]), "n": (x.get("name") or "").strip(),
                            "l": x.get("stream_icon") or "", "c": str(x.get("category_id") or ""),
                            "r": x.get("rating") or "",
                            "t": int(x.get("added") or 0),
                            "x": x.get("container_extension") or "mkv"})
            else:
                out.append({"id": int(x["series_id"]), "n": (x.get("name") or "").strip(),
                            "l": x.get("cover") or "", "c": str(x.get("category_id") or ""),
                            "r": x.get("rating") or "", "g": x.get("genre") or "",
                            "t": int(x.get("last_modified") or 0),
                            "y": (x.get("releaseDate") or "")[:4]})
        except (KeyError, ValueError, TypeError):
            continue
    return out

def catalog(kind, refresh=False):
    if kind not in KINDS: raise Upstream("Tipus de contingut desconegut.", "bad_request")
    key = "cat2_" + kind
    with _lock:
        if not refresh and key in _mem: return _mem[key]
    cached = None if refresh else _load_cache(key, CATALOG_TTL)
    if cached is None:
        a_items, a_cats = KINDS[kind]
        base = creds()
        cats  = api(a_cats, base=base) or []
        items = api(a_items, base=base) or []
        cached = {"cats": [{"id": str(c.get("category_id")), "n": c.get("category_name") or ""}
                           for c in cats],
                  "items": _slim(kind, items),
                  "at": int(time.time())}
        _save_cache(key, cached)
    with _lock:
        _mem[key] = cached
    return cached

# ─────────────────────────────── guia (xmltv) ───────────────────────────────────

_TS = re.compile(r"^(\d{14})\s*([+-]\d{4})?$")

def _epoch(s):
    m = _TS.match((s or "").strip())
    if not m: return None
    t = time.strptime(m.group(1), "%Y%m%d%H%M%S")
    off = m.group(2)
    if not off:                       # sense zona: ho llegim com a hora local
        return int(time.mktime(t))
    sign = 1 if off[0] == "+" else -1
    return calendar.timegm(t) - sign * (int(off[1:3]) * 3600 + int(off[3:5]) * 60)

def epg(refresh=False):
    key = "epg"
    with _lock:
        if not refresh and key in _mem: return _mem[key]
    cached = None if refresh else _load_cache(key, EPG_TTL)
    if cached is None:
        s, u, p = creds()
        raw = fetch(f"{s}/xmltv.php?" + urllib.parse.urlencode({"username": u, "password": p}), 40)
        try:
            root = ElementTree.fromstring(raw)
        except ElementTree.ParseError as e:
            raise _classify(e) from e
        by = {}
        for pr in root.iter("programme"):
            cid = (pr.get("channel") or "").strip()
            if not cid: continue
            st, en = _epoch(pr.get("start")), _epoch(pr.get("stop"))
            if st is None or en is None: continue
            ti = pr.find("title")
            by.setdefault(cid, []).append(
                {"s": st, "e": en, "t": (ti.text or "").strip() if ti is not None else ""})
        for v in by.values(): v.sort(key=lambda x: x["s"])
        cached = {"by": by, "at": int(time.time())}
        _save_cache(key, cached)
    with _lock:
        _mem[key] = cached
    return cached

# ─────────────────────── preferències locals (favorits, vist) ───────────────────

def _store(name, default):
    p = os.path.join(CACHE, name + ".json")
    if not os.path.exists(p): return default
    try:
        with open(p, encoding="utf-8") as f: return json.load(f)
    except Exception:
        return default

def _store_put(name, data):
    p = os.path.join(CACHE, name + ".json")
    with open(p + ".tmp", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False)
    os.replace(p + ".tmp", p)

# ──────────────────── imatges: proxy amb memòria cau a disc ─────────────────────

IMG_DIR = os.path.join(CACHE, "img")
os.makedirs(IMG_DIR, exist_ok=True)
_IMG_EXT = {"image/png": ".png", "image/jpeg": ".jpg", "image/gif": ".gif",
            "image/webp": ".webp", "image/svg+xml": ".svg"}

def image(url):
    """Descarrega i guarda una imatge remota. Retorna (bytes, mime) o (None, None)."""
    if not url.startswith(("http://", "https://")): return None, None
    import hashlib
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()
    for ext, mime in ((".png","image/png"), (".jpg","image/jpeg"), (".gif","image/gif"),
                      (".webp","image/webp"), (".svg","image/svg+xml"), (".bin","image/jpeg")):
        p = os.path.join(IMG_DIR, h + ext)
        if os.path.exists(p):
            if os.path.getsize(p) == 0: return None, None      # sabíem que fallava
            with open(p, "rb") as f: return f.read(), mime
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=12) as r:
            data = r.read(3_000_000)
            mime = (r.headers.get("Content-Type") or "image/jpeg").split(";")[0].strip()
    except Exception:
        open(os.path.join(IMG_DIR, h + ".bin"), "wb").close()   # marca de fracàs
        return None, None
    ext = _IMG_EXT.get(mime, ".bin")
    with open(os.path.join(IMG_DIR, h + ext), "wb") as f: f.write(data)
    return data, mime

# ─────────────────────────────── traspàs al VLC ─────────────────────────────────

VLC = "/Applications/VLC.app"
_now = {"label": None, "kind": None, "id": None, "since": None}

def vlc_installed(): return os.path.isdir(VLC)

def vlc_quit():
    try:
        subprocess.run(["osascript", "-e", 'tell application "VLC" to quit'],
                       capture_output=True, timeout=6)
    except Exception:
        pass
    try:
        subprocess.run(["pkill", "-x", "VLC"], capture_output=True, timeout=4)
    except Exception:
        pass
    _now.update({"label": None, "kind": None, "id": None, "since": None})

def vlc_play(url, label, kind, ident):
    if not vlc_installed():
        raise Upstream("No trobo el VLC a /Applications. Instal·la'l per poder reproduir.",
                       "no_vlc")
    vlc_quit()                       # el compte només permet una connexió alhora
    time.sleep(0.7)
    subprocess.Popen(["open", "-a", VLC, url],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    _now.update({"label": label, "kind": kind, "id": ident, "since": int(time.time())})

def stream_url(kind, ident, ext="mkv"):
    s, u, p = creds()
    if kind == "live":   return f"{s}/live/{u}/{p}/{ident}.ts"
    if kind == "movie":  return f"{s}/movie/{u}/{p}/{ident}.{ext}"
    if kind == "series": return f"{s}/series/{u}/{p}/{ident}.{ext}"
    raise Upstream("Tipus de reproducció desconegut.", "bad_request")

# ───────────────────────────── cicle de vida ────────────────────────────────────

_last_ping = time.time()
_httpd = None

def _reaper():
    while True:
        time.sleep(10)
        if time.time() - _last_ping > IDLE_TIMEOUT:
            sys.stderr.write("\n[IPTBe] Cap pestanya oberta. Tanco el servidor.\n")
            shutdown()
            return

def shutdown():
    def go():
        time.sleep(0.4)
        try: _httpd.shutdown()
        except Exception: pass
    threading.Thread(target=go, daemon=True).start()

# ──────────────────────────────── HTTP ──────────────────────────────────────────

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw): super().__init__(*a, directory=APP, **kw)

    def log_message(self, *a): pass

    def _send(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _fail(self, e):
        if isinstance(e, Upstream):
            code = 503 if e.kind in ("timeout","offline","network","http","malformed") else 400
            self._send({"error": e.msg, "kind": e.kind, "detail": e.detail}, code)
        else:
            self._send({"error": f"Error intern: {e}", "kind": "error"}, 500)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        if not n: return {}
        try: return json.loads(self.rfile.read(n).decode("utf-8"))
        except Exception: return {}

    def guess_type(self, path):
        t = super().guess_type(path)
        if t in ("text/html", "text/css", "application/javascript", "text/javascript"):
            return t + "; charset=utf-8"
        return t

    # ---- GET ----
    def do_GET(self):
        global _last_ping
        u = urllib.parse.urlparse(self.path)
        q = urllib.parse.parse_qs(u.query)
        p = u.path
        if not p.startswith("/api/"):
            if p == "/": self.path = "/index.html"
            return super().do_GET()
        _last_ping = time.time()
        try:
            if p == "/api/status":
                e = read_env()
                return self._send({"configured": bool(e.get("IPTV_SERVER") and e.get("IPTV_USER")),
                                   "server": e.get("IPTV_SERVER",""), "user": e.get("IPTV_USER",""),
                                   "vlc": vlc_installed(), "now": _now})
            if p == "/api/catalog":
                kind = (q.get("kind") or ["live"])[0]
                return self._send(catalog(kind, refresh=q.get("refresh") == ["1"]))
            if p == "/api/epg":
                return self._send(epg(refresh=q.get("refresh") == ["1"]))
            if p.startswith("/api/series/"):
                sid = p.rsplit("/", 1)[-1]
                return self._send(api("get_series_info", series_id=sid))
            if p.startswith("/api/movie/"):
                vid = p.rsplit("/", 1)[-1]
                return self._send(api("get_vod_info", vod_id=vid))
            if p == "/api/prefs":
                return self._send({"favorites": _store("favorites", {}),
                                   "progress":  _store("progress", {})})
            if p == "/api/img":
                src = (q.get("u") or [""])[0]
                data, mime = image(src)
                if not data:
                    self.send_response(404); self.send_header("Content-Length", "0")
                    self.end_headers(); return
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(len(data)))
                self.send_header("Cache-Control", "public, max-age=2592000")
                self.end_headers(); self.wfile.write(data); return
            if p == "/api/now":
                return self._send({"now": _now})
            self._send({"error": "Ruta desconeguda."}, 404)
        except Exception as e:
            self._fail(e)

    # ---- POST ----
    def do_POST(self):
        global _last_ping
        _last_ping = time.time()
        p = urllib.parse.urlparse(self.path).path
        b = self._body()
        try:
            if p == "/api/ping":
                return self._send({"ok": True, "now": _now})
            if p == "/api/test":
                s = (b.get("server") or "").strip().rstrip("/")
                u_, pw = (b.get("user") or "").strip(), (b.get("pass") or "").strip()
                if not (s and u_ and pw):
                    return self._send({"error": "Omple els tres camps.", "kind": "bad_request"}, 400)
                if not s.startswith(("http://", "https://")): s = "https://" + s
                d = api(None, base=(s, u_, pw))
                info = (d or {}).get("user_info") or {}
                if str(info.get("auth")) != "1":
                    return self._send({"error": "Usuari o contrasenya incorrectes.",
                                       "kind": "auth"}, 400)
                exp = info.get("exp_date")
                return self._send({"ok": True, "server": s,
                                   "status": info.get("status"),
                                   "expires": (time.strftime("%d/%m/%Y", time.localtime(int(exp)))
                                               if str(exp or "").isdigit() else ""),
                                   "max_connections": info.get("max_connections") or "?"})
            if p == "/api/config":
                s = (b.get("server") or "").strip().rstrip("/")
                if not s.startswith(("http://", "https://")): s = "https://" + s
                write_env(s, (b.get("user") or "").strip(), (b.get("pass") or "").strip())
                with _lock: _mem.clear()
                return self._send({"ok": True})
            if p == "/api/play":
                kind, ident = b.get("kind"), b.get("id")
                url = stream_url(kind, ident, b.get("ext") or "mkv")
                vlc_play(url, b.get("label") or "", kind, ident)
                return self._send({"ok": True, "now": _now})
            if p == "/api/stop":
                vlc_quit()          # aturar la reproducció sí que tanca el VLC
                return self._send({"ok": True, "now": _now})
            if p == "/api/prefs":
                if "favorites" in b: _store_put("favorites", b["favorites"])
                if "progress"  in b: _store_put("progress",  b["progress"])
                return self._send({"ok": True})
            if p == "/api/quit":
                shutdown()          # el VLC es queda com estigui: potser hi estàs veient alguna cosa
                return self._send({"ok": True})
            self._send({"error": "Ruta desconeguda."}, 404)
        except Exception as e:
            self._fail(e)

class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

def free_port(start=8477):
    for port in range(start, start + 40):
        with socket.socket() as s:
            try:
                s.bind(("127.0.0.1", port)); return port
            except OSError:
                continue
    raise SystemExit("No trobo cap port lliure entre 8477 i 8517.")

def main():
    global _httpd
    port = free_port()
    _httpd = Server(("127.0.0.1", port), Handler)
    url = f"http://127.0.0.1:{port}/"
    print(f"\n  IPTBe en marxa a {url}")
    print(f"  Per aturar-lo: el botó «Aturar» del navegador, o Ctrl+C aquí.")
    print(f"  Si tanques la pestanya, es tanca sol al cap de {IDLE_TIMEOUT} segons.\n")
    threading.Thread(target=_reaper, daemon=True).start()
    threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        _httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Aturat.")
    finally:
        try: _httpd.server_close()
        except Exception: pass
    print("  Servidor tancat.")

if __name__ == "__main__":
    main()
