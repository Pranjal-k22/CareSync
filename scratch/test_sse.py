import urllib.request

url = "http://127.0.0.1:8000/telemetry/stream"
print(f"Connecting to SSE stream at {url}...")
req = urllib.request.Request(url, headers={'Accept': 'text/event-stream'})

try:
    with urllib.request.urlopen(req, timeout=10) as response:
        for i in range(10):
            line = response.readline()
            if line:
                print("SSE Line:", line.decode('utf-8').strip())
except Exception as e:
    print("SSE Stream error/timeout:", e)
