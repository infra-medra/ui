"""Runs a command while source files are temporarily mutated, then restores them.

Used to capture honest "red" evidence for tests that already pass: break the
behavior under test, confirm the test fails on an assertion, and put the code
back. The restore happens in a `finally` block, so a failing command, a missing
mutation target or an interrupt never leaves a mutated file on disk.

Usage:
    python3 -I projects/site/tools/mutate-run.py \
        --replace FILE OLD NEW [--replace FILE OLD NEW ...] -- COMMAND

Every occurrence of OLD in FILE is replaced with NEW. The exit code is the
command's, or 97 when a mutation target is not found (so a typo can never pass
as a failing test).
"""
import shutil
import subprocess
import sys


def parse(argv):
    if '--' not in argv:
        sys.exit('missing "--" before the command')
    split = argv.index('--')
    head, command = argv[:split], ' '.join(argv[split + 1:])
    mutations = []
    i = 0
    while i < len(head):
        if head[i] != '--replace' or i + 3 >= len(head):
            sys.exit('expected: --replace FILE OLD NEW')
        mutations.append((head[i + 1], head[i + 2], head[i + 3]))
        i += 4
    if not mutations or not command:
        sys.exit('expected at least one --replace and a command')
    return mutations, command


def main():
    mutations, command = parse(sys.argv[1:])
    backups = []
    code = 97
    try:
        for file, old, new in mutations:
            with open(file) as handle:
                text = handle.read()
            if old not in text:
                print(f'mutation target not found in {file}', file=sys.stderr)
                return 97
            # One backup per file, taken before its first mutation, so a file named in
            # several --replace options is restored to its original content.
            if file not in backups:
                shutil.copy2(file, file + '.mutbak')
                backups.append(file)
            with open(file, 'w') as handle:
                handle.write(text.replace(old, new))
        code = subprocess.call(command, shell=True)
    finally:
        for file in backups:
            shutil.move(file + '.mutbak', file)
    return code


if __name__ == '__main__':
    sys.exit(main())
