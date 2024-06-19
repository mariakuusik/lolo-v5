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
    setupCategoryFilter();
});

function loadFeeds() {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    localStorage.setItem('allArticles', JSON.stringify([])); // Clear allArticles before loading feeds
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
    feedItem.id = `feed-${btoa(feedUrl)}`; // Create a unique ID for the feed list item
    feedItem.innerHTML = `
        ${feedName} 
        <button onclick="editFeed('${feedUrl}', '${feedName}')">Edit</button>
        <button onclick="removeFeed('${feedUrl}', 'feed-${btoa(feedUrl)}')">Remove</button>
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

    // Re-render articles
    const allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];
    const updatedArticles = allArticles.filter(article => article.feedUrl !== feedUrl);
    localStorage.setItem('allArticles', JSON.stringify(updatedArticles));
    filterAndRenderArticles();
}

function editFeed(feedUrl, feedName) {
    console.log('Editing feed:', feedUrl, feedName);
    const existingForm = document.getElementById('editFeedForm');
    if (existingForm) {
        existingForm.remove(); // Remove any existing form before creating a new one
    }

    const editForm = document.createElement('div');
    editForm.innerHTML = `
        <form id="editFeedForm">
            <label for="editFeedName">Feed Name:</label>
            <input type="text" id="editFeedName" value="${feedName}" required>
            <label for="editFeedUrl">Feed URL:</label>
            <input type="url" id="editFeedUrl" value="${feedUrl}" required>
            <button type="submit">Save Changes</button>
            <button type="button" onclick="cancelEdit()">Cancel</button>
        </form>
    `;
    document.body.appendChild(editForm);
    console.log('Edit form appended to body');

    document.getElementById('editFeedForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const newFeedName = document.getElementById('editFeedName').value;
        const newFeedUrl = document.getElementById('editFeedUrl').value;
        updateFeed(feedUrl, newFeedUrl, newFeedName);
        document.body.removeChild(editForm);
    });
}

function cancelEdit() {
    const editForm = document.getElementById('editFeedForm').parentElement;
    document.body.removeChild(editForm);
}

function updateFeed(oldUrl, newUrl, newName) {
    let feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feeds = feeds.map(feed => {
        if (feed.url === oldUrl) {
            return { url: newUrl, name: newName };
        }
        return feed;
    });
    localStorage.setItem('feeds', JSON.stringify(feeds));
    location.reload();
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

        const sortedArticles = sortArticlesByDate(data.items);
        appendArticles(sortedArticles, feedName, feedUrl);
        updateCategories();
    } catch (error) {
        console.error('Error fetching the RSS feed:', error);
    }
}

function sortArticlesByDate(articles) {
    return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
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
    let allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];

    articles.forEach(item => {
        item.feedName = feedName;
        item.feedUrl = feedUrl;
        allArticles.push(item);
    });

    localStorage.setItem('allArticles', JSON.stringify(allArticles));
    filterAndRenderArticles();
}

function setupCategoryFilter() {
    const categorySelect = document.getElementById('categorySelect');
    categorySelect.addEventListener('change', filterAndRenderArticles);
}

function updateCategories() {
    const allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];
    const categories = new Set();
    allArticles.forEach(article => {
        article.categories.forEach(category => categories.add(category));
    });

    const categorySelect = document.getElementById('categorySelect');
    categorySelect.innerHTML = '<option value="all">All</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function filterAndRenderArticles() {
    const content = document.getElementById('content');
    const allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];

    const selectedCategory = document.getElementById('categorySelect').value;
    const filteredArticles = selectedCategory === 'all' ? allArticles : allArticles.filter(article => article.categories.includes(selectedCategory));

    content.innerHTML = '';

    const sortedAllArticles = sortArticlesByDate(filteredArticles);

    sortedAllArticles.forEach(item => {
        const article = document.createElement('div');
        article.className = 'article';
        article.dataset.feedUrl = item.feedUrl;

        const imageUrl = handleImage(item);

        const categories = item.categories && item.categories.length > 0 ? item.categories : ['Uncategorized'];
        const categoriesHtml = categories.map(category => `<span class="category">${category}</span>`).join(', ');

        article.innerHTML = `
            <div class="feed-name">${item.feedName}</div> <!-- Display feed name -->
            ${imageUrl ? `<img src="${imageUrl}" alt="${item.title}" class="article-image" width="300">` : ''}
            <h2><a href="${item.link}" target="_blank">${item.title}</a></h2>
            <p>${item.description}</p>
            <p>Categories: ${categoriesHtml}</p>
            <small>${new Date(item.pubDate).toLocaleString()}</small>
        `;
        content.appendChild(article);
    });
}
