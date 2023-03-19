const axios = require("axios");
const cheerio = require("cheerio");


wiki_base_url = "https://en.wikipedia.org/wiki/";

async function get_http_response(url) {
    response = await axios.get(wiki_url);

    return response.data;
}

function get_scrapped_links(html_response) {
    //Take Html body and return all the achor tag link in string
    links = new Set();
    const $ = cheerio.load(html_response);
    link_tags = $("a");
    link_tags.each((i, link_tag) => {
        const link = $(link_tag).attr("href");
        if (link) links.add(link);
    });

    return Array.from(links);
}

async function get_links_on_page(wiki_page_name, http_response = get_http_response, scrapped_links = get_scrapped_links) {
    if (!wiki_page_name) return [];
    wiki_url = wiki_base_url + wiki_page_name;

    response = await http_response(wiki_url);

    links = [];
    if (response) links = scrapped_links(response);

    valid_links = [];
    links.forEach((link) => {
        if (link.startsWith("/wiki/") && !link.includes(":") && !link.includes("#"))
            valid_links.push(link.replace("/wiki/", ""));
    });
    return valid_links;
}

async function find_ladder(source, target, links_on_page = get_links_on_page) {
    if (!source || !target) return [[], 0];
    queue = [[source]];
    visited = new Set();
    pagesVisited = 0;
    while (queue.length) {
        path = queue.splice(0, 1)[0];
        vertex = path[path.length - 1];
        if (vertex == target) {
            return [path, pagesVisited];
        } else if (!visited.has(vertex)) {
            pagesVisited += 1;
            neighbours = await links_on_page(vertex);
            for (idx in neighbours) {
                new_path = Array.from(path);
                new_path.push(neighbours[idx]);
                queue.push(new_path);
                if (neighbours[idx] == target) {
                    return [new_path, pagesVisited];
                }
            }
            visited.add(vertex);
        }
    }
    return [[], pagesVisited];
}


const express = require('express')
const app = express()
const port = 3000
app.use(express.json());

app.post('/api/wiki_ladder', async (req, res) => {
    source = req.body.start;
    if (source) source.replace(wiki_base_url, '');
    target = req.body.target;
    if (target) target.replace(wiki_base_url, '');

    [ladder, pagesVisited] = await get_ladder(source, target);
    result = {
        "ladder": ladder.map((link) => wiki_base_url + link),
        "ladderLength": ladder.length,
        "pagesVisited": pagesVisited
    };
    res.send(result);
});

app.listen(port, () => {
    console.log(`Listening on: ${port}`)
});

// data = request.get_json()
// start = data['start'].replace('https://en.wikipedia.org/wiki/', '')
// target = data['target'].replace('https://en.wikipedia.org/wiki/', '')

// start_time = time.time()
// ladder, pagesVisited = find_ladder(start, target)
// end_time = time.time()
// response = {
// "ladder": list(map(lambda link: 'https://en.wikipedia.org/wiki/'+link, ladder)),
// "ladderLength": len(ladder),
// "pagesVisited": pagesVisited,
// "runTime": str(end_time-start_time) + 's'
// }
// return jsonify(response)

// find_ladder('Fruit', 'Strawberry').then((answerArray) => {
//     console.log(answerArray);
// });
// get_links_on_page('Node.js', get_http_response, get_scrapped_links)
module.exports = { get_links_on_page, find_ladder, get_http_response, get_scrapped_links, wiki_base_url };
