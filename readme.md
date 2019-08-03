# Unofficial Mario Maker Api
This api utilizes Cheerio, & Axios to scrape and fetch data from Mario Makers bookmark site.

## Methods
All public methods are asynchronous functions

### login
Logs into Mario Maker bookmark site and sets session


@param: json object that takes username and password

@returns: returns the MM class instance

```js
(async () => {
    let loggedIn = await MM.login({
        'username': 'Nintendo Username',
        'password': 'Nintendo Pass'
    });
})()
```

### bookmark
This requires you to be logged in so you would log in first then start bookmarking such as:


* @param: courseId
* @returns: Course JSON object

```js
(async () => {
    let loggedIn = await MM.login({
        'username': 'Nintendo Username',
        'password': 'Nintendo Pass'
    });
    
    let bookmarkData = await loggedIn.bookmark('F870-0000-03EE-27E7');
    console.log(bookmarkData);
})()
```

### unBookmark
As above requires you to be logged in so you would log in first then start unbookmarking such as:


* @param: courseId
* @returns: Course JSON object

```js
(async () => {
    let loggedIn = await MM.login({
        'username': 'Nintendo Username',
        'password': 'Nintendo Pass'
    });
    
    let bookmarkData = await loggedIn.unBookmark('F870-0000-03EE-27E7');
    console.log(bookmarkData);
})()
```

### getBookmarks
As above requires you to be logged in so you would log in first then get all user bookmarks such as:


* @param: options, only takes paged
* @returns: All user bookmarked courses JSON array

```js
(async () => {
    let bookmarksData = await MM.getBookmarks({
        paged: 1
    });
    console.log(bookmarksData);
})()
```

### getCourse
This does not require being signed in to use


* @param: courseId
* @returns: JSON info about course

```js
(async () => {
    let loggedIn = await MM.login({
        'username': 'Nintendo Username',
        'password': 'Nintendo Pass'
    });
    
    let courseData = await MM.getCourse('DF5D-0000-03B7-E3F3');
    console.log(courseData);
})()
```

### Full Example
You can chain multiple async functions like below with promise all

```js
(async () => {
    let loggedIn = await MM.login({
        'username': 'Nintendo Username',
        'password': 'Nintendo Pass'
    });
    
    let bookmarkPromises = [
        loggedIn.bookmark('DF5D-0000-03B7-E3F3'),
        loggedIn.bookmark('F870-0000-03EE-27E7')
    ];

    //Get all the data from the async functions
    let bookmarkData = await Promise.all(bookmarkPromises);
    console.log(bookmarkData);

    let unBookmarkPromises = [
        loggedIn.unBookmark('DF5D-0000-03B7-E3F3'),
        loggedIn.unBookmark('F870-0000-03EE-27E7')
    ];

    //Get all the data from the asyc functions
    let unBookmarkData = await Promise.all(unBookmarkPromises);
    console.log(unBookmarkData);
})()
```

## TODO:
Need to still add conditionals for when things go wrong, like wrong course id or not logged in.

## Contribution:
For contribution please open up an issue and follow gitflow workflow practices: https://www.atlassian.com/git/tutorials/comparing-workflows