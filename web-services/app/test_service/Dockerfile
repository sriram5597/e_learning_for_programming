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

WORKDIR /online-test-service

COPY ./requirements.txt /online-test-service

RUN virtualenv -p python3 online-test_env
RUN /bin/sh -c "source online-test_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /online-test-service

RUN aws configure < /online-test-service/.aws/config

ENV STAGE=dev
EXPOSE 6080

CMD gunicorn -b 0.0.0.0:6080 wsgi:app