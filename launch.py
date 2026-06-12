"""Launch backend as an independent process on Windows"""
import subprocess, sys, os, time

workdir = os.path.join(os.path.dirname(__file__), "backend")
python = os.path.join(workdir, "venv", "Scripts", "python.exe")
script = os.path.join(workdir, "run.py")
log = os.path.join(os.path.dirname(__file__), "backend.log")

proc = subprocess.Popen(
    [python, script],
    cwd=workdir,
    stdout=open(log, "w"),
    stderr=subprocess.STDOUT,
    creationflags=subprocess.CREATE_NO_WINDOW | subprocess.DETACHED_PROCESS,
)

print(f"Backend launched with PID {proc.pid}")
print(f"Log: {log}")
