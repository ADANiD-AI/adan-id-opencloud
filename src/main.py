#!/usr/bin/env python3
"""
ADANiD CLI - Quranic AI Terminal Agent
"""

import click
import os
import json
from pathlib import Path
from adanid_cli.ai_engine import QuranicAIEngine
from adanid_cli.utils import load_context, save_checkpoint

@click.command()
@click.option('-p', '--prompt', help='Prompt for AI analysis')
@click.option('--audio', help='Audio file for Tajweed analysis')
@click.option('--output-format', default='text', type=click.Choice(['text', 'json', 'stream-json']))
@click.option('--model', default='quranlab-ai', help='AI model to use')
@click.option('--include-directories', help='Directories to include in context')
def main(prompt, audio, output_format, model, include_directories):
    """ADANiD CLI - Quranic AI Terminal Agent"""
    
    # Initialize AI engine
    engine = QuranicAIEngine(model=model)
    
    # Load context if available
    context = load_context()
    
    if prompt:
        # Non-interactive mode
        result = engine.analyze(prompt, audio=audio, context=context)
        
        if output_format == 'json':
            click.echo(json.dumps(result, indent=2, ensure_ascii=False))
        elif output_format == 'stream-json':
            for chunk in engine.stream_analyze(prompt, audio=audio, context=context):
                click.echo(json.dumps(chunk, ensure_ascii=False))
        else:
            click.echo(result.get('text', str(result)))
    
    else:
        # Interactive mode
        click.echo("🌙 ADANiD CLI - Quranic AI Terminal Agent")
        click.echo("Type 'exit' to quit, 'help' for commands")
        
        while True:
            try:
                user_input = click.prompt("\n> ", prompt_suffix="")
                if user_input.lower() == 'exit':
                    break
                elif user_input.lower() == 'help':
                    show_help()
                    continue
                
                result = engine.analyze(user_input, context=context)
                click.echo(f"\n{result.get('text', str(result))}")
                
                # Save checkpoint
                save_checkpoint(user_input, result)
                
            except KeyboardInterrupt:
                break
            except Exception as e:
                click.echo(f"❌ Error: {e}")

def show_help():
    """Show help message"""
    help_text = """
Commands:
  exit        - Quit the CLI
  help        - Show this help message
  /abjad      - Calculate Abjad value
  /tajweed    - Validate Tajweed rules  
  /fiqh       - Get Fiqh ruling
  /hadith     - Authenticate Hadith
  
Examples:
  > Calculate Abjad of بسم الله
  > Check Tajweed in this recitation --audio file.mp3
  > What is Hanafi ruling on cryptocurrency?
    """
    click.echo(help_text)

if __name__ == '__main__':
    main()
