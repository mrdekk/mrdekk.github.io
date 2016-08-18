#!/bin/bash

cwd=$(pwd)

docker run \
	-it \
	-e DEBUG=true \
	-p 4000:4000 \
	-v ${cwd}:/src \
	--label=mrdekk_blog \
	mrdekk/blog \
	bundle exec jekyll serve \
	--host 0.0.0.0
