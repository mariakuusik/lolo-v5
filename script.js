document.addEventListener('DOMContentLoaded', () => {
    const defaultFeedUrl = 'https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss';
    fetchFeed(defaultFeedUrl);
});

async function fetchFeed(feedUrl) {
    console.log('Fetching feed:', feedUrl);
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
        const data = await response.json();
        console.log('Data:', data);

        if (data.status !== 'ok') {
            throw new Error('Failed to fetch RSS feed');
        }

        renderArticles(data.items);
    } catch (error) {
        console.error('Error fetching the RSS feed:', error);
    }
}

function renderArticles(articles) {
    const content = document.getElementById('content');
    content.innerHTML = '';

    articles.forEach(item => {
        console.log(JSON.stringify(item, null, 2));

        const article = document.createElement('div');
        article.className = 'article';

        const imageUrl = item.enclosure ? item.enclosure.link : '';

        article.innerHTML = `
            ${imageUrl ? `<img src="${imageUrl}" alt="${item.title}" class="article-image" width="300">` : ''}
            <h2><a href="${item.link}" target="_blank">${item.title}</a></h2>
            <p>${item.description}</p>
            <small>${new Date(item.pubDate).toLocaleString()}</small>
        `;
        content.appendChild(article);
    });
}
