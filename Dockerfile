FROM ubuntu:20.04

RUN apt-get update && apt-get install -y python3 python3-pip wget
RUN pip3 install --upgrade pip
RUN pip3 install --upgrade setuptools
RUN mkdir /code
WORKDIR /code
COPY . /code/
RUN wget https://dl.secondarymetabolites.org/releases/5.1.2/antismash-5.1.2.tar.gz
RUN pip3 install antismash-5.1.2.tar.gz
RUN rm antismash-5.1.2.tar.gz
RUN wget http://github.com/bbuchfink/diamond/releases/download/v0.9.31/diamond-linux64.tar.gz
RUN tar xzf diamond-linux64.tar.gz
RUN rm diamond-linux64.tar.gz
RUN cp diamond /usr/local/bin
RUN pip3 install -r requirements.txt
