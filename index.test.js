const Main = require('./index.js');


describe('Get List Wiki Page Links', () => {
    test('page_name received is null', async () => {
        mock_http_response = jest.fn();
        mock_get_scrapped_links = jest.fn();
        result = await Main.get_links_on_page(null, mock_http_response, mock_get_scrapped_links);
        expect(mock_http_response.mock.calls).toHaveLength(0);
        expect(mock_get_scrapped_links.mock.calls).toHaveLength(0);
        expect(result).toStrictEqual([]);

    });

    test('http response failure', async () => {
        mock_http_response = jest.fn();
        mock_get_scrapped_links = jest.fn();
        result = await Main.get_links_on_page('Mango', mock_http_response, mock_get_scrapped_links);
        expect(result).toStrictEqual([]);
        expect(mock_http_response.mock.calls).toHaveLength(1);
        expect(mock_http_response.mock.calls[0][0]).toEqual(Main.wiki_base_url + 'Mango');
        expect(mock_get_scrapped_links.mock.calls).toHaveLength(0);

    });

    test('scrapper function with correct paramter', async () => {
        mock_http_response = jest.fn(x => 'http_response');
        mock_get_scrapped_links = jest.fn(x => []);
        result = await Main.get_links_on_page('Mango', mock_http_response, mock_get_scrapped_links);
        expect(result).toStrictEqual([]);
        expect(mock_http_response.mock.calls).toHaveLength(1);
        expect(mock_get_scrapped_links.mock.calls).toHaveLength(1);
        expect(mock_get_scrapped_links.mock.calls[0][0]).toEqual('http_response');
    });

    test('Filters Invalid Links', async () => {
        mock_http_response = jest.fn(x => 'http_response');
        mock_get_scrapped_links = jest.fn().mockReturnValue([
            '/wiki/foo',
            'https://google.com/',
            '/wiki/tem:hardi',
            '/wiki/hardik#purohit',
            '/wiki/valid']);
        result = await Main.get_links_on_page('Mango', mock_http_response, mock_get_scrapped_links);
        expect(mock_http_response.mock.calls).toHaveLength(1);
        expect(mock_get_scrapped_links.mock.calls).toHaveLength(1);
        expect(result).toEqual(['foo', 'valid']);
    });



});

describe('Get Path and pages visited', () => {

    test('Source is null', async () => {
        mock_links_on_page = jest.fn(x => []);
        result = await Main.find_ladder(null, 'Z', mock_links_on_page);
        expect(mock_links_on_page.mock.calls).toHaveLength(0);
        expect(result).toStrictEqual([[], 0]);

    });

    test('Target is null', async () => {
        mock_links_on_page = jest.fn(x => []);
        result = await Main.find_ladder('Mango', null, mock_links_on_page);
        expect(mock_links_on_page.mock.calls).toHaveLength(0);
        expect(result).toStrictEqual([[], 0]);

    });

    test('Source is invalid link', async () => {
        mock_links_on_page = jest.fn(x => []);
        result = await Main.find_ladder('Mango', 'Apple', mock_links_on_page);
        expect(mock_links_on_page.mock.calls).toHaveLength(1);
        expect(mock_links_on_page.mock.calls[0][0]).toEqual('Mango');
        expect(result).toStrictEqual([[], 1]);

    });
    test('Source and target are same', async () => {
        mock_links_on_page = jest.fn(x => []);
        result = await Main.find_ladder('Mango', 'Mango', mock_links_on_page);
        expect(mock_links_on_page.mock.calls).toHaveLength(0);
        expect(result).toStrictEqual([['Mango'], 0]);

    });

    //Consider Following graph
    // A -> B, C, D
    // B -> E
    // C -> []
    // D -> Z
    // E -> X, Y
    test('Finding Valid Path', async () => {
        mock_links_on_page = jest.fn()
            .mockReturnValue([])
            .mockReturnValueOnce(['B', 'C', 'D'])
            .mockReturnValueOnce(['E'])
            .mockReturnValueOnce([])
            .mockReturnValueOnce(['Z'])
            .mockReturnValueOnce(['X', 'Y'])

        result = await Main.find_ladder('A', 'Z', mock_links_on_page);

        expect(mock_links_on_page.mock.calls).toHaveLength(4);
        expect(mock_links_on_page.mock.calls[0][0]).toEqual('A');
        expect(mock_links_on_page.mock.calls[1][0]).toEqual('B');
        expect(mock_links_on_page.mock.calls[2][0]).toEqual('C');
        expect(mock_links_on_page.mock.calls[3][0]).toEqual('D');
        expect(result).toStrictEqual([['A', 'D', 'Z'], 4]);

    });

    test('Finding No Path Found', async () => {
        mock_links_on_page = jest.fn()
            .mockReturnValue([])
            .mockReturnValueOnce(['B', 'C', 'D'])
            .mockReturnValueOnce(['E'])
            .mockReturnValueOnce([])
            .mockReturnValueOnce(['E'])
            .mockReturnValueOnce(['X', 'Y']);

        result = await Main.find_ladder('A', 'Z', mock_links_on_page);

        expect(mock_links_on_page.mock.calls).toHaveLength(7);
        expect(mock_links_on_page.mock.calls[0][0]).toEqual('A');
        expect(mock_links_on_page.mock.calls[1][0]).toEqual('B');
        expect(mock_links_on_page.mock.calls[2][0]).toEqual('C');
        expect(mock_links_on_page.mock.calls[3][0]).toEqual('D');
        expect(mock_links_on_page.mock.calls[4][0]).toEqual('E');
        expect(mock_links_on_page.mock.calls[5][0]).toEqual('X');
        expect(mock_links_on_page.mock.calls[6][0]).toEqual('Y');
        expect(result).toStrictEqual([[], 7]);
    });
    test('No Page is called twice for links', async () => {
        mock_links_on_page = jest.fn()
            .mockReturnValue([])
            .mockReturnValueOnce(['B', 'C', 'D'])
            .mockReturnValueOnce(['E'])
            .mockReturnValueOnce(['D', 'B', 'E'])
            .mockReturnValueOnce(['E'])
            .mockReturnValueOnce(['X', 'A'])
        result = await Main.find_ladder('A', 'Z', mock_links_on_page);
        expect(mock_links_on_page.mock.calls).toHaveLength(6);//6-> number of unique nodes in graph
        expect(result).toStrictEqual([[], 6]);
    });
});


// describe("POST /api/wiki_ladder", () => {
//     it("should return all products", async () => {
//       const res = await request(app).get("/api/products");
//       expect(res.statusCode).toBe(200);
//       expect(res.body.length).toBeGreaterThan(0);
//     });
//   });
