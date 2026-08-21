#!/bin/bash

# Builds the site on the host, without the docker wrapper from docker.sh.
# Uses en_US.UTF-8 because C.UTF-8 does not exist on macOS.
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

bundle exec jekyll build
