from main import get_on_page_links
def test_get_on_page_links():
    class Fake_Wiki_Page():
        def get_html_content(self, wiki_page):
            return '<a href="/wiki/hardik"></a>'

    assert(get_on_page_links('Fruit', Fake_Wiki_Page))