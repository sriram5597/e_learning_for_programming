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

WORKDIR /online-code-service

COPY ./requirements.txt /online-code-service

RUN virtualenv -p python3 online_code_env
RUN /bin/sh -c "source online_code_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /online-code-service

RUN mkdir tmp
RUN aws configure < /online-code-service/.aws/config

ENV STAGE=dev
EXPOSE 7000

CMD gunicorn -b 0.0.0.0:7000 wsgi:app