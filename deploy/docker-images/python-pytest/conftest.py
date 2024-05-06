import sys
import re

unwanted_patterns = [
    r'in \d+\.\d+s',  # Time information
    r'test session starts',
    r'collecting...',
    r'^platform .*? -- /usr/local/bin/python$',  # Platform information
    r'^cachedir: .+?$',  # Cache directory
    r'^rootdir: .+?$'   # Root directory
]

class FilteredStdout:
    def __init__(self, original):
        self.original = original
        self.last_was_blank = False  # To track state of last write

    def write(self, msg):
        # Apply regex to filter out unwanted messages containing time information
        if not any(re.search(pattern, msg.strip()) for pattern in unwanted_patterns):
            if msg.strip():  # If message is not just empty or whitespace
                self.original.write(msg)
                self.last_was_blank = False
            elif not self.last_was_blank:  # Only write a newline if the last message wasn't blank
                self.original.write(msg)
                self.last_was_blank = True

    def flush(self):
        self.original.flush()

    def __getattr__(self, attr):
        # This method ensures that we handle attributes that might be asked of sys.stdout
        return getattr(self.original, attr)

def pytest_configure(config):
    # Replace sys.stdout with our filtered version if it hasn't been replaced yet
    if not isinstance(sys.stdout, FilteredStdout):
        sys.stdout = FilteredStdout(sys.stdout)

def pytest_unconfigure(config):
    # Restore original stdout when done
    if isinstance(sys.stdout, FilteredStdout):
        sys.stdout = sys.stdout.original