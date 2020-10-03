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

WORKDIR /flowchart

COPY ./requirements.txt /flowchart

RUN virtualenv -p python3 current_course_env
RUN /bin/sh -c "source current_course_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /flowchart

RUN aws configure < /flowchart/.aws/config

ENV STAGE=dev
EXPOSE 7080

CMD gunicorn -b 0.0.0.0:7080 wsgi:app