document.addEventListener('DOMContentLoaded', () => {
    const defaultFeedUrl = 'https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss';
    loadFeeds();
    fetchFeed(defaultFeedUrl);

    document.getElementById('newRSSForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const rssUrl = document.getElementById('rssUrl').value;
        if (rssUrl) {
            addFeed(rssUrl);
            document.getElementById('rssUrl').value = ''; // Clear the input field
        }
    });
});

function loadFeeds() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feeds.forEach(feedUrl => fetchFeed(feedUrl));
}

function addFeed(feedUrl) {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    if (!feeds.includes(feedUrl)) {
        feeds.push(feedUrl);
        localStorage.setItem('feeds', JSON.stringify(feeds));
        fetchFeed(feedUrl);
    }
}

async function fetchFeed(feedUrl) {
    console.log('Fetching feed:', feedUrl);
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
        const data = await response.json();
        console.log('Data:', data);

        if (data.status !== 'ok') {
            throw new Error('Failed to fetch RSS feed');
        }
        appendArticles(data.items);
    } catch (error) {
        console.error('Error fetching the RSS feed:', error);
    }
}

function handleImage(item) {
    let imageUrl = '';
    if (item.enclosure) {
        imageUrl = item.enclosure.link;
    } else if (item['media:content'] && item['media:content'].url) {
        imageUrl = item['media:content'].url;
    } else if (item['media:thumbnail'] && item['media:thumbnail'].url) {
        imageUrl = item['media:thumbnail'].url;
    }
    return imageUrl;
}

function appendArticles(articles) {
    const content = document.getElementById('content');

    articles.forEach(item => {
        console.log(JSON.stringify(item, null, 2));

        const article = document.createElement('div');
        article.className = 'article';

        const imageUrl = handleImage(item);

        const categories = item.categories && item.categories.length > 0 ? item.categories : ['Uncategorized'];
        const categoriesHtml = categories.map(category => `<span class="category">${category}</span>`).join(', ');

        article.innerHTML = `
            ${imageUrl ? `<img src="${imageUrl}" alt="${item.title}" class="article-image" width="300">` : ''}
            <h2><a href="${item.link}" target="_blank">${item.title}</a></h2>
            <p>${item.description}</p>
            <p>Categories: ${categoriesHtml}</p>
            <small>${new Date(item.pubDate).toLocaleString()}</small>
        `;
        content.appendChild(article);
    });
}




