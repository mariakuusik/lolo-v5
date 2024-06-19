document.addEventListener('DOMContentLoaded', () => {
    const defaultFeedUrl = 'https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss';
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    if (feeds.length === 0) {
        const feedName = 'Default Feed';
        addFeed(defaultFeedUrl, feedName);
    } else {
        loadFeeds();
    }
    setupAddFeedForm();
});

function loadFeeds() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feeds.forEach(feed => {
        fetchFeed(feed.url, feed.name);
        displayFeed(feed.url, feed.name);
    });
}

function setupAddFeedForm() {
    document.getElementById('newRSSForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const rssUrl = document.getElementById('rssUrl').value;
        if (rssUrl) {
            const feedName = await getFeedName(rssUrl);
            addFeed(rssUrl, feedName);
            document.getElementById('rssUrl').value = '';
        }
    });
}

function addFeed(feedUrl, feedName) {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    if (!feeds.some(feed => feed.url === feedUrl)) {
        feeds.push({ url: feedUrl, name: feedName });
        localStorage.setItem('feeds', JSON.stringify(feeds));
        fetchFeed(feedUrl, feedName);
        displayFeed(feedUrl, feedName);
    }
}

function displayFeed(feedUrl, feedName) {
    const feedList = document.getElementById('feeds');
    const feedItem = document.createElement('li');
    feedItem.id = `feed-${btoa(feedUrl)}`; // Creates a unique ID for the feed list item
    feedItem.innerHTML = `
        ${feedName} <button onclick="removeFeed('${feedUrl}', 'feed-${btoa(feedUrl)}')">Remove</button>
    `;
    feedList.appendChild(feedItem);
}

async function getFeedName(feedUrl) {
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
        const data = await response.json();
        return data.feed.title || feedUrl;
    } catch (error) {
        console.error('Error fetching feed name:', error);
        return feedUrl;
    }
}

function removeFeed(feedUrl, feedItemId) {
    let feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feeds = feeds.filter(feed => feed.url !== feedUrl);
    localStorage.setItem('feeds', JSON.stringify(feeds));

    const feedItem = document.getElementById(feedItemId);
    if (feedItem) {
        feedItem.remove();
    }

    const articles = document.querySelectorAll(`.article[data-feed-url="${feedUrl}"]`);
    articles.forEach(article => article.remove());
}

async function fetchFeed(feedUrl, feedName) {
    console.log('Fetching feed:', feedUrl);
    try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
        const data = await response.json();
        console.log('Data:', data);

        if (data.status !== 'ok') {
            throw new Error('Failed to fetch RSS feed');
        }
        appendArticles(data.items, feedName, feedUrl);
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

function appendArticles(articles, feedName, feedUrl) {
    const content = document.getElementById('content');

    articles.forEach(item => {
        console.log(JSON.stringify(item, null, 2));

        const article = document.createElement('div');
        article.className = 'article';
        article.dataset.feedUrl = feedUrl;

        const imageUrl = handleImage(item);

        const categories = item.categories && item.categories.length > 0 ? item.categories : ['Uncategorized'];
        const categoriesHtml = categories.map(category => `<span class="category">${category}</span>`).join(', ');

        article.innerHTML = `
            <div class="feed-name">${feedName}</div>
            ${imageUrl ? `<img src="${imageUrl}" alt="${item.title}" class="article-image" width="300">` : ''}
            <h2><a href="${item.link}" target="_blank">${item.title}</a></h2>
            <p>${item.description}</p>
            <p>Categories: ${categoriesHtml}</p>
            <small>${new Date(item.pubDate).toLocaleString()}</small>
        `;
        content.appendChild(article);
    });
}
