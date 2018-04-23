FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

# Basics
RUN apt-get -y update && \
    apt-get -y upgrade && \
    apt-get install -y git vim

# Python
RUN apt-get install -y python3-pip && \
    apt-get -y update && \
    apt-get install python-pip

RUN pip3 install awscli

COPY ./package.json .
COPY lambda_functions/EC2_server.js .

RUN npm install
RUN npm install pm2 -g

# EXPOSE 80
# pm2 start my_app.js --node-args="--max-old-space-size=7000"  
# CMD ["node", "EC2_server.js", "--max-old-space-size=7000"]
# && \
# git clone https://github.com/canaantt/Python
# RUN mkdir Python
# COPY ./ Python
# Start
# EXPOSE 80
# CMD ["python3", "Python/api.py"]
