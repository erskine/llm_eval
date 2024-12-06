#!/app/.venv/bin/python
import click
import subprocess
import time
import sys
import os

@click.group()
def cli():
    """Management CLI for LLM Evaluation services"""
    pass

@cli.command()
@click.argument('service', type=click.Choice(['fastapi', 'streamlit', 'all']))
def restart(service):
    """Restart specified service(s)"""
    if service in ['all', 'fastapi']:
        subprocess.run(['supervisorctl', 'restart', 'fastapi'])
    if service in ['all', 'streamlit']:
        subprocess.run(['supervisorctl', 'restart', 'streamlit'])

@cli.command()
def status():
    """Show status of all services"""
    subprocess.run(['supervisorctl', 'status'])

@cli.command()
@click.argument('service', type=click.Choice(['fastapi', 'streamlit']))
def logs(service):
    """Show logs for specified service"""
    log_file = f"/var/log/supervisor/llm_eval_{service}.log"
    subprocess.run(['tail', '-f', log_file])

@cli.command()
def dev():
    """Run services in development mode with automatic reloading"""
    try:
        # Kill any existing processes
        subprocess.run(['supervisorctl', 'stop', 'all'])
        time.sleep(1)

        # Start FastAPI with reload
        fastapi = subprocess.Popen([
            '/app/.venv/bin/uvicorn',
            'llm_eval.api:app',
            '--reload',
            '--host', '0.0.0.0',
            '--port', '8000'
        ])

        # Start Streamlit with reload
        streamlit = subprocess.Popen([
            '/app/.venv/bin/streamlit',
            'run',
            'llm_eval/ui.py',
            '--server.port', '8501',
            '--server.address', '0.0.0.0',
            '--server.runOnSave=true'
        ])

        print("Development servers started. Press CTRL+C to stop.")
        fastapi.wait()
        streamlit.wait()

    except KeyboardInterrupt:
        print("\nStopping development servers...")
        fastapi.terminate()
        streamlit.terminate()
        sys.exit(0)

if __name__ == '__main__':
    cli() 