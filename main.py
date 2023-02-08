import requests
from bs4 import BeautifulSoup
import time

def get_on_page_links(wiki_page):
  url = 'https://en.wikipedia.org/wiki/' + wiki_page
  response = requests.get(url)
  soup = BeautifulSoup(response.content, 'html.parser')
  links = set()
  for link in soup.find_all('a'):
    link = link.get('href')
    if link and link.startswith('/wiki/') and not (link.count(':') or link.count('#')):
      links.add(link.replace('/wiki/', ''))
  return links



def find_ladder(source, target):
    queue = [[source]]
    visited = set()
    pagesVisited = 0
    while queue:
        path = queue.pop(0)
        vertex = path[-1]
        if vertex == target:
            return path,pagesVisited
        elif vertex not in visited:
            pagesVisited+=1
            for current_neighbour in get_on_page_links(vertex):
                new_path = list(path)
                new_path.append(current_neighbour)
                queue.append(new_path)
                if current_neighbour == target:
                    return new_path, pagesVisited;
            visited.add(vertex)
  
    return None,pagesVisited


from flask import Flask, jsonify, request

app= Flask(__name__)
@app.route("/api/wikiladder", methods=["POST"])
def setName():
    data = request.get_json()
    start = data['start'].replace('https://en.wikipedia.org/wiki/', '')
    target = data['target'].replace('https://en.wikipedia.org/wiki/', '')

    start_time = time.time()
    ladder, pagesVisited = find_ladder(start, target)
    end_time = time.time()
    response = {
        "ladder": list(map(lambda link: 'https://en.wikipedia.org/wiki/'+link, ladder)),
        "ladderLength": len(ladder),
        "pagesVisited": pagesVisited,
        "runTime": str(end_time-start_time) + 's'
    }
    return jsonify(response)  

#  main thread of execution to start the server
if __name__=='__main__':
    app.run(debug=True)