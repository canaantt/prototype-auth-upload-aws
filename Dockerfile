FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive

# Basics
RUN apt-get -y update && \
    apt-get -y upgrade && \
    apt-get install -y git vim npm curl && \
    apt-get -y update

# Python
RUN apt-get install -y python3-pip && \
    apt-get -y update
RUN pip3 install awscli


COPY /server /home/server

RUN curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN apt-get -y -qq install nodejs
RUN npm install -g pm2
RUN npm install

# EXPOSE 80
# pm2 start my_app.js --node-args="--max-old-space-size=7000"  
CMD ["bash"]
# CMD ["node", "/home/server/EC2_server.js", "--max-old-space-size=7000"]
# && \
# git clone https://github.com/canaantt/Python
# RUN mkdir Python
# COPY ./ Python
# Start
# EXPOSE 80
# CMD ["python3", "Python/api.py"]
