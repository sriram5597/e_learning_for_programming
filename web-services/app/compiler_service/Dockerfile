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

WORKDIR /compiler-service

COPY ./requirements.txt /compiler-service

RUN virtualenv -p python3 compiler_env
RUN /bin/sh -c "source compiler_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /compiler-service

RUN aws configure < /compiler-service/.aws/config
RUN mkdir temp

ENV STAGE=dev
EXPOSE 7070

CMD gunicorn -b 0.0.0.0:7070 wsgi:app