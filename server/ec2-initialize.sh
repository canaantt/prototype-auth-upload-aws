#!bin/bash
sudo -i
docker pull canaantt/os-upload-serialization 
docker run --name upload --env AWS_ACCESS_KEY_ID=AKIAJGNIZKZRNXV2IRDQ --env AWS_SECRET_ACCESS_KEY=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 canaantt/os-upload-serialization:latest
