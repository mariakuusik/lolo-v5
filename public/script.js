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
    updateCategories();
});

async function fetchClutterFreeContent(articleUrl) {
    const proxyUrl = 'https://lolo-v5-1-fq2x.onrender.com/webparser'; // Updated to Render URL

    try {
        const response = await fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: articleUrl })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch clutter-free content');
        }

        const data = await response.json();
        console.log('Clutter-free content data:', data);
        return data;
    } catch (error) {
        console.error('Error fetching clutter-free content:', error);
        alert('Failed to fetch clutter-free content. Please try again.');
    }
}

function openModal(content) {
    const modal = document.getElementById('myModal');
    const modalBody = document.getElementById('modal-body');
    const span = document.getElementsByClassName('close')[0];

    const articleTitle = content.title || 'No title available';
    const articleAuthor = content.author ? `By ${content.author}` : 'Author not available';
    const articleDate = content.date_published ? new Date(content.date_published).toLocaleDateString() : 'Date not available';
    const articleContent = content.content || 'No content available';
    const articleImage = content.lead_image_url ? `<img src="${content.lead_image_url}" alt="${articleTitle}" style="max-width: 100%;">` : '';

    modalBody.innerHTML = `
    <h1>${articleTitle}</h1>
    <p>${articleAuthor}</p>
    <p>${articleDate}</p>
    ${articleImage}
    <div>${articleContent}</div>
`;

    modal.style.display = 'block';

    span.onclick = function () {
        modal.style.display = 'none';
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    renderTweets();
}

function renderTweets() {
    const tweets = document.querySelectorAll('.twitter-tweet');
    tweets.forEach(tweet => {
        const script = document.createElement('script');
        script.setAttribute('src', 'https://platform.twitter.com/widgets.js');
        script.setAttribute('charset', 'utf-8');
        tweet.appendChild(script);
    });
}


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

async function addFeed(feedUrl, feedName) {
    const feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    if (feeds.some(feed => feed.url === feedUrl)) {
        displaySuccessMessage("This feed is already in your list.");
        return;
    }

    try {
        await fetchFeed(feedUrl, feedName);
        feeds.push({ url: feedUrl, name: feedName });
        localStorage.setItem('feeds', JSON.stringify(feeds));
        displayFeed(feedUrl, feedName);
        displaySuccessMessage("New feed successfully added!");
    } catch (error) {
        console.error('Failed to add feed', error);
        alert('Failed to add feed. Please check the URL and try again');
    }
}

function displaySuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = message;
    successMessage.style.display = 'block';

    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function displayFeed(feedUrl, feedName) {
    const feedList = document.getElementById('feeds');
    const feedItem = document.createElement('li');
    feedItem.className = 'feed-item';
    feedItem.id = `feed-${btoa(feedUrl)}`; // Create a unique ID for the feed list item

    const feedNameSpan = document.createElement('span');
    feedNameSpan.textContent = feedName;
    feedNameSpan.classList.add('feed-name');

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.onclick = () => toggleEditForm(feedItem, feedUrl, feedName);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.onclick = () => removeFeed(feedUrl, `feed-${btoa(feedUrl)}`);

    feedItem.appendChild(feedNameSpan);
    feedItem.appendChild(editButton);
    feedItem.appendChild(removeButton);

    feedList.appendChild(feedItem);
}

function toggleEditForm(feedItem, feedUrl, feedName) {
    const existingForm = feedItem.querySelector('.collapsible-menu');
    if (existingForm) {
        existingForm.remove();
        const buttons = feedItem.querySelectorAll('button');
        buttons.forEach(button => button.style.display = 'inline-block');
        return;
    }

    const editForm = document.createElement('div');
    editForm.className = 'collapsible-menu';
    editForm.innerHTML = `
        <label for="editFeedName">Feed Name:</label>
        <input type="text" id="editFeedName" value="${feedName}" required>
        <label for="editFeedUrl">Feed URL:</label>
        <input type="url" id="editFeedUrl" value="${feedUrl}" required>
        <button type="submit">Save</button>
        <button type="button" onclick="cancelEdit(this)">Cancel</button>
    `;

    editForm.querySelector('button[type="submit"]').onclick = () => {
        const newFeedName = editForm.querySelector('#editFeedName').value;
        const newFeedUrl = editForm.querySelector('#editFeedUrl').value;
        updateFeed(feedUrl, newFeedUrl, newFeedName, feedItem);
    };

    const buttons = feedItem.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'none');
    feedItem.appendChild(editForm);
    editForm.style.display = 'block';
}

function cancelEdit(button) {
    const editForm = button.closest('.collapsible-menu');
    const feedItem = editForm.closest('.feed-item');
    editForm.remove();
    const buttons = feedItem.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'inline-block');
}

function updateFeed(oldUrl, newUrl, newName, feedItem) {
    let feeds = JSON.parse(localStorage.getItem('feeds')) || [];
    feeds = feeds.map(feed => {
        if (feed.url === oldUrl) {
            return { url: newUrl, name: newName };
        }
        return feed;
    });
    localStorage.setItem('feeds', JSON.stringify(feeds));

    feedItem.querySelector('.feed-name').textContent = newName;
    feedItem.querySelector('.collapsible-menu').remove();
    const buttons = feedItem.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'inline-block');
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
        await appendArticles(sortedArticles, feedName, feedUrl);
        updateCategories();
    } catch (error) {
        console.error('Error fetching the RSS feed:', error);
        throw error;
    }
}

function sortArticlesByDate(articles) {
    return articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
}

function handleImage(item) {
    let imageUrl = '';
    if (item.enclosure && item.enclosure.link) {
        imageUrl = item.enclosure.link;
    }
    else if (item['media:content'] && item['media:content'].url) {
        imageUrl = item['media:content'].url;
    }
    else if (item['media:thumbnail'] && item['media:thumbnail'].url) {
        imageUrl = item['media:thumbnail'].url;
    }
    else if (item.enclosure && item.enclosure.thumbnail) {
        imageUrl = item.enclosure.thumbnail;
    }
    return imageUrl;
}

async function appendArticles(articles, feedName, feedUrl) {
    let allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];

    articles.forEach(item => {
        item.feedName = feedName;
        item.feedUrl = feedUrl;
        allArticles.push(item);
    });

    localStorage.setItem('allArticles', JSON.stringify(allArticles));
    await filterAndRenderArticles();
}

function updateCategories() {
    const allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];
    const categories = new Set();
    allArticles.forEach(article => {
        article.categories.forEach(category => categories.add(category));
    });

    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    const sortedCategories = Array.from(categories).sort((a, b) => a.localeCompare(b));

    const allCategoriesItem = document.createElement('li');
    allCategoriesItem.textContent = 'All';
    allCategoriesItem.classList.add('category-item');
    allCategoriesItem.addEventListener('click', () => filterByCategory('all'));
    categoryList.appendChild(allCategoriesItem);

    sortedCategories.forEach(category => {
        const listItem = document.createElement('li');
        listItem.textContent = category;
        listItem.classList.add('category-item');
        listItem.addEventListener('click', () => filterByCategory(category));
        categoryList.appendChild(listItem);
    });
}

function filterByCategory(category) {
    filterAndRenderArticles(category);
}

async function filterAndRenderArticles(selectedCategory = 'all') {
    const content = document.getElementById('content');
    const allArticles = JSON.parse(localStorage.getItem('allArticles')) || [];

    const filteredArticles = filterArticlesByCategory(allArticles, selectedCategory);

    content.innerHTML = '';

    const sortedAllArticles = sortArticlesByDate(filteredArticles);

    for (const item of sortedAllArticles) {
        const article = createArticleElement(item);
        content.appendChild(article);
    }
}

function filterArticlesByCategory(allArticles, selectedCategory) {
    return selectedCategory === 'all' ? allArticles : allArticles.filter(article => article.categories.includes(selectedCategory));
}

function createArticleElement(item) {
    const article = document.createElement('div');
    article.className = 'article';
    article.dataset.feedUrl = item.feedUrl;

    const imageUrl = handleImage(item);

    const categories = item.categories && item.categories.length > 0 ? item.categories : ['Uncategorized'];
    const categoriesHtml = categories.map(category => `<span class="category">${category}</span>`).join(', ');

    const articleContent = document.createElement('div');
    articleContent.className = 'article-content';

    if (imageUrl) {
        const image = document.createElement('img');
        image.src = imageUrl;
        image.alt = item.title;
        image.className = 'article-image';
        image.dataset.url = item.link;
        articleContent.appendChild(image);
    }

    const textContent = document.createElement('div');
    textContent.className = 'text-content';

    const feedBadge = document.createElement('div');
    feedBadge.className = 'feed-badge';
    feedBadge.textContent = item.feedName;

    const title = document.createElement('h2');
    title.innerHTML = `<a href="#" class="article-title" data-url="${item.link}">${item.title}</a>`;

    const description = document.createElement('p');
    description.className = 'article-description';
    description.dataset.url = item.link;
    description.textContent = item.description;

    const categoryPara = document.createElement('p');
    categoryPara.innerHTML = `Categories: ${categoriesHtml}`;

    const date = document.createElement('small');
    date.textContent = new Date(item.pubDate).toLocaleString();

    textContent.appendChild(feedBadge);
    textContent.appendChild(title);
    textContent.appendChild(description);
    textContent.appendChild(categoryPara);
    textContent.appendChild(date);

    articleContent.appendChild(textContent);
    article.appendChild(articleContent);

    // event listeners for title, description, and image
    const clickableElements = article.querySelectorAll('.article-title, .article-description, .article-image');
    clickableElements.forEach(element => {
        element.addEventListener('click', async (event) => {
            event.preventDefault();
            const articleUrl = event.target.dataset.url;
            const clutterFreeContent = await fetchClutterFreeContent(articleUrl);
            openModal(clutterFreeContent);
        });
    });

    return article;
}