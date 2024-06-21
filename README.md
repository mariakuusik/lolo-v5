# Lolo v5

## Overview
Lolo v5 is a responsive web application designed to display RSS feeds. Users can add, edit, and remove their preferred feeds, and filter articles by categories. It is built with HTML, CSS, and JavaScript. Server.js handles CORS issues and acts as a Proxy for fetching clutter-free content. To start the server, navigate to "rrs-proxy" directory and run the command: node server.js

## Workflow

### Day 1: Project Initialization and Setup

TO-DO:
* Create new project (started with Vue.js)
* Clean up, remove unnecessary boilerplate code
* Create project structure
* Setup GitHub
* Fetch and display initial RSS data

Problems:
* Proxy error - could not load initial data. Eventually created a Local CORS Proxy with Express.js.

### Day 2: Basic Functionality

TO-DO:
* Add "edit" and "delete" funcionality
* Add "add new feed" functionality
* Save feeds to local storage?

Problems:
* Logic error with adding new feed - existing content is resaved instead of new content.
Turns out to be an error with the way the CORS server is set up.

### Day 3: Basic Functionality

Problems:
* I had a to-do list for this day but while working on it I realized that there are problems with Vue.js framework that I don't know how to solve and the project is getting too complicated. In the middle of the day I decided to start over, using JavaScript without any frameworks.

New TO-DO:
* Redo Day 1 and Day 2 tasks with pure JavaScript
* Filtering based on categories functionality

### Day 4: Advanced functionality

TO-DO:
* Implement Mercury API web parser
* Display modal

Problems:
* Cannot get the web parser to work, trying different proxy solutions. Eventually I create a node.js server to handle the API call.

### Day 5: Styling

TO-DO:
* General layout and responsive CSS
* Fix bugs as much as possible
* V2 Next steps / Future improvements
* Upload to Render/Vercel

Problems:
* I find some bugs that I don't have time to work on anymore
* Some of the JS functions are getting lenghty and hard to read because of the added functionality
* "feature/styling" version control branch contains a lot of changes and potentially should have been broken down to smaller branches

## V2 - Next steps in the project
* Filtering by feed - clicking on feed name either in the feeds list or the badge next to an article should filter out articles from this feed only
* Implement Media Queries for smaller screen sizes
* Add default image to articles without image
* Functionality to show only new articles (from the same day)
* Write tests for core functionality of the application
* Fix bug: Sidebar: editing feed. Autmatically cancel "edit feed" when changes are not saved or cancelled and another "edit" button is pressed.
* Fix bug: editing feed. At the moment, edited badge is shown only after refreshing the page. Should be instant after pressing the "save" button.

## Conclusion

Over the course of five days, the Lolo v5 project evolved from initial setup to a fully functional RSS feed reader application. Despite facing challenges such as proxy errors, framework limitations, and complex functionality requirements, the project successfully achieved its core objectives. The application now allows users to add, edit, and delete RSS feeds, filter articles by categories, and view clutter-free content using a local proxy server.

Future improvements and additional features have been identified, such as filtering by feed, enhancing media queries for better responsiveness, adding default images for articles without images, and implementing functionality to highlight new articles. Moreover, there are a few bugs that need to be addressed to ensure a smoother user experience.