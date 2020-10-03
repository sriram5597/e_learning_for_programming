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

WORKDIR /course-service

COPY ./requirements.txt /course-service

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install --ignore-installed distlib==0.3.0 -r requirements.txt

COPY . /course-service

RUN aws configure < /course-service/.aws/config

RUN mkdir temp

ENV STAGE=dev
ENV HOST=SERVER

EXPOSE 5000

CMD gunicorn -b 0.0.0.0:5000 wsgi:app