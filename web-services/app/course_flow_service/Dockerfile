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

WORKDIR /course-flow-service

COPY ./requirements.txt /course-flow-service

RUN virtualenv -p python3 course_flow_env
RUN /bin/sh -c "source course_flow_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /course-flow-service

RUN aws configure < /course-flow-service/.aws/config

ENV STAGE=dev
ENV HOST=LOCAL
EXPOSE 5080

CMD gunicorn -b 0.0.0.0:5080 wsgi:app