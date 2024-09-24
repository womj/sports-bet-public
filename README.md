# sports-ui
```
install docker, docker compose

Fromt the top of the directory

docker-compose build
docker-compose up

http://0.0.0.0:5173/ in the browser
```

```
ssh -i ~/Downloads/misiorek-ec2.pem ubuntu@ec2-52-53-174-50.us-west-1.compute.amazonaws.com
```
```
docker save -o frontend.tar sportsui_sports-ui:latest
scp -i ~/Downloads/misiorek-ec2.pem frontend.tar ubuntu@ec2-52-53-174-50.us-west-1.compute.amazonaws.com:~/

sudo docker load -i frontend.tar
sudo docker run -d --network host sportsui_sports-ui:latest
```