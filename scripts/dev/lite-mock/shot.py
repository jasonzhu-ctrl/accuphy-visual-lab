import os, subprocess, time, sys
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for name in sys.argv[1:]:
    out=f"{name}.png"
    if os.path.exists(out): os.remove(out)
    prof=f"/tmp/cs-{name}-{int(time.time())}"
    p=subprocess.Popen([CH,"--headless=new","--window-size=1600,900","--hide-scrollbars","--no-first-run","--allow-file-access-from-files",f"--user-data-dir={prof}","--virtual-time-budget=4000",f"--screenshot={os.path.abspath(out)}","file://"+os.path.abspath(f"{name}.html")],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    t0=time.time(); seen=None
    while time.time()-t0<90:
        if p.poll() is not None: break
        if os.path.exists(out) and os.path.getsize(out)>10000:
            seen=seen or time.time()
            if time.time()-seen>3: break
        time.sleep(0.5)
    if p.poll() is None: p.kill()
    subprocess.run(["rm","-rf",prof])
    print(out, os.path.getsize(out) if os.path.exists(out) else "MISSING", round(time.time()-t0,1),"s")
