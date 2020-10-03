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

WORKDIR /content-service

COPY ./requirements.txt /content-service

RUN virtualenv -p python3 content_env
RUN /bin/sh -c "source content_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /content-service

RUN aws configure < /content-service/.aws/config

ENV STAGE=dev
EXPOSE 6060

CMD gunicorn -b 0.0.0.0:6060 wsgi:app