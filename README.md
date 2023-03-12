# wiki_racer

## Install python packages

pip install requests bs4
pip install -U Flask

## Run Server

python main.py

## To send request type following command in terminal

curl -X POST http://localhost:5000/api/wikiladder
   -H "Content-Type: application/json"
   -d '{"start":"Fruit", "target":"Strawberry"}'
