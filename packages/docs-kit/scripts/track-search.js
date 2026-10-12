// Inlined in the <head> of every page tracked by Umami: sends what readers search for, and what they open.
// Listens on the document because Pagefind mounts its UI lazily, from Starlight's or starlight-versions' search.
// `search` is sent once the reader stops typing, with the result count: the zero-result queries are the missing pages.
;(() => {
    const SETTLE_DELAY = 1500
    const MIN_LENGTH = 3

    let timer
    let lastQuery = ''

    const queryOf = () => document.querySelector('.pagefind-ui__search-input')?.value.trim() ?? ''

    // "12 results for twig" / "No results for twig": the leading number, if any
    const resultCount = () => {
        const message = document.querySelector('.pagefind-ui__message')?.textContent.trim() ?? ''

        return Number.parseInt(message, 10) || 0
    }

    const track = (event, data) => window.umami?.track(event, data)

    const trackSearch = () => {
        clearTimeout(timer)

        const query = queryOf()
        if (query.length < MIN_LENGTH || query === lastQuery) {
            return
        }

        lastQuery = query
        track('search', { query, results: resultCount() })
    }

    document.addEventListener('input', (event) => {
        if (!event.target.matches?.('.pagefind-ui__search-input')) {
            return
        }

        clearTimeout(timer)
        timer = setTimeout(trackSearch, SETTLE_DELAY)
    })

    document.addEventListener('click', (event) => {
        const link = event.target.closest?.('.pagefind-ui__result-link')
        if (!link) {
            return
        }

        // A reader quicker than the delay leaves the page before the timer: count the search first
        trackSearch()
        track('search-click', { query: queryOf(), page: new URL(link.href).pathname })
    })
})()
