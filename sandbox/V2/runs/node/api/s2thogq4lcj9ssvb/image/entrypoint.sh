#!/bin/sh

# IMPORTANT: the line ends must be LF, not CRLF

# exec node ${CODE} <&0 >&1 2>&1

# echo "Hello World" | sh -c "node ${CODE}" 

# sh -c 'while true; do sleep 1; done'

sh -c "node ${CODE}" < tests.txt