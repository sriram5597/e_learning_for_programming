FROM alpine

LABEL maintainer =  "SK <stacle.sk19@gmail.com>"

RUN apk update
RUN apk add py3-pip

RUN apk add --no-cache libressl-dev \
    musl-dev \
    libffi-dev \
    python3-dev \
    pkgconfig \
    make \
    gcc \
    curl \
    openssl-dev 

RUN pip3 install --upgrade pip
RUN pip3 install virtualenv

WORKDIR /video-streaming-service

COPY ./requirements.txt /video-streaming-service

RUN virtualenv -p python3 video_stream_env
RUN /bin/sh -c "source video_stream_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /video-streaming-service
RUN mkdir tmp

RUN aws configure < /video-streaming-service/.aws/config

ENV STAGE=dev
ENV HOST=LOCAL
EXPOSE 6000

CMD gunicorn -b 0.0.0.0:6000 wsgi:app