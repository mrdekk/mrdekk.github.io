FROM ruby:2.2.7
MAINTAINER mrdekk

RUN apt-get update -y && \
    apt-get install -y nodejs python-pygments && \
    apt-get clean

WORKDIR /src
ADD Gemfile /src/Gemfile
ADD Gemfile.lock /src/Gemfile.lock

RUN export LC_ALL=en_US.UTF-8
RUN export LANG=en_US.UTF-8

ADD run.sh /src/run.sh

# Fix a problem following http://stackoverflow.com/questions/29020478/error-installing-nokogiri-on-bundle-install-but-already-installed
RUN bundle config build.nokogiri --use-system-libraries && \
    bundle install

VOLUME /src
EXPOSE 4000

# Setup timezone
ENV TIMEZONE Asia/Yekaterinburg
RUN cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo "${TIMEZONE}" > /etc/timezone
