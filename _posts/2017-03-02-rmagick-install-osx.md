---
layout: post
title: Установка rmagick на Mac OS X (macOS)
tags:
 - cocoapods
 - recipe
 - osx
---

Если у вас по каким-то причинам не устанавливается rmagick, например:

```
current directory: /home/kb10uy/.rbenv/versions/2.3.1/lib/ruby/gems/2.3.0/bundler/gems/rmagick-42aa8ce34f61/ext/RMagick
/home/kb10uy/.rbenv/versions/2.3.1/bin/ruby -r ./siteconf20160812-28804-12a4s7p.rb extconf.rb
checking for gcc... yes
checking for Magick-config... no
checking for pkg-config... yes
checking for outdated ImageMagick version (<= 6.4.9)... no
checking for presence of MagickWand API (ImageMagick version >= 6.9.0)... no
checking for Ruby version >= 1.8.5... yes
checking for stdint.h... yes
checking for sys/types.h... yes
checking for wand/MagickWand.h... no

Can't install RMagick 2.15.4. Can't find MagickWand.h.
*** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of necessary
libraries and/or headers.  Check the mkmf.log file for more details.  You may
need configuration options.

Provided configuration options:
        --with-opt-dir
        --without-opt-dir
        --with-opt-include
        --without-opt-include=${opt-dir}/include
        --with-opt-lib
        --without-opt-lib=${opt-dir}/lib
        --with-make-prog
        --without-make-prog
        --srcdir=.
        --curdir
        --ruby=/home/kb10uy/.rbenv/versions/2.3.1/bin/$(RUBY_BASE_NAME)

To see why this extension failed to compile, please check the mkmf.log which can be found here:

  /home/kb10uy/.rbenv/versions/2.3.1/lib/ruby/gems/2.3.0/bundler/gems/extensions/armv6l-linux/2.3.0-static/rmagick-42aa8ce34f61/mkmf.log

extconf failed, exit code 1
```

Или например так:

```
jjdevenuta(opal)$ gem install rmagick
Fetching: rmagick-2.13.1.gem (100%)
Building native extensions.  This could take a while...
ERROR:  Error installing rmagick:
ERROR: Failed to build gem native extension.

/Users/jjdevenuta/.rvm/rubies/ruby-1.9.2-head/bin/ruby extconf.rb
checking for Ruby version >= 1.8.5... yes
checking for gcc... yes
checking for Magick-config... no
Can't install RMagick 2.13.1. Can't find Magick-config in /Users/jjdevenuta/.rvm/gems/ruby-1.9.2-head@rails3/bin:/Users/jjdevenuta/.rvm/gems/ruby-1.9.2-head@global/bin:/Users/jjdevenuta/.rvm/rubies/ruby-1.9.2-head/bin:/Users/jjdevenuta/.rvm/bin:/usr/local/bin:/usr/local/sbin:/usr/local/mysql/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/git/bin:/usr/X11/bin

*** extconf.rb failed ***
Could not create Makefile due to some reason, probably lack of
necessary libraries and/or headers.  Check the mkmf.log file for more
details.  You may need configuration options.

Provided configuration options:
    --with-opt-dir
    --without-opt-dir
    --with-opt-include
    --without-opt-include=${opt-dir}/include
    --with-opt-lib
    --without-opt-lib=${opt-dir}/lib
    --with-make-prog
    --without-make-prog
    --srcdir=.
    --curdir
    --ruby=/Users/jjdevenuta/.rvm/rubies/ruby-1.9.2-head/bin/ruby
```

То это значит что у вас в системе стоит imagemagick 7 который не поддерживается rmagick (там переименовали и переместили важные заголовочные файлы). Чтобы поставить rmagick вам надо imagemagick 6, сделать это можно так

``` bash
brew update
brew rm imagemagick
brew install imagemagick@6
brew link imagemagick@6 --force
bundle
```

Взято [отсюдова](https://github.com/rmagick/rmagick/issues/256)
