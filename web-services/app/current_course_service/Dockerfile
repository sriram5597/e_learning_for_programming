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

WORKDIR /current-course

COPY ./requirements.txt /current-course

RUN virtualenv -p python3 current_course_env
RUN /bin/sh -c "source current_course_env/bin/activate"

RUN pip install cffi && \
    pip install --no-cache cryptography==2.1.4

RUN pip3 install -r requirements.txt

COPY . /current-course

RUN aws configure < /current-course/.aws/config

ENV STAGE=dev
EXPOSE 9000

CMD gunicorn -b 0.0.0.0:9000 wsgi:app