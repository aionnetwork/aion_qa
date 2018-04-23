#!/bin/bash

for p in 'DROPPED' 'INCLUDED'; do
	printf '%s = ' "$p"; grep -E "$p" "${1:-.}" | wc -l
done
