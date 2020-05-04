#!/usr/bin/env python
import os
import sys
import argparse

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'router.settings')

    argv = sys.argv
    cmd = argv[2:] if len(argv) > 1 else None
    if cmd is not None:  # limit the extra arguments to certain commands
        parser = argparse.ArgumentParser(add_help=False)
        parser.add_argument('--logdir')
        args, argv = parser.parse_known_args(argv)
        # We can save the argument as an environmental variable, in
        # which case it's to retrieve from within `project.settings`,
        os.environ["SUMMARY_DIR"] = args.logdir if not args.logdir is None else ""
        

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(argv)
