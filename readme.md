# Unofficial Mario Maker Api
This api utilizes Cheerio, & Axios to scrape and fetch data from Mario Makers bookmark site.

## Methods
All public methods are asynchronous functions

### login

### bookmark

### unBookmark

### getBookmarks

### getCourse

### Examples
```js
(async () => {
    let loggedIn = await MM.login({
        'username': 'Nintendo Username',
        'password': 'Nintendo Pass'
    });
    
    let bookmarkPromises = [
        loggedIn.bookmark('DF5D-0000-03B7-E3F3'),
        loggedIn.bookmark('F870-0000-03EE-27E7')
    ]

    let bookmarkData = await Promise.all(bookmarkPromises);

    let unBookmarkPromises = [
        loggedIn.unBookmark('DF5D-0000-03B7-E3F3'),
        loggedIn.unBookmark('F870-0000-03EE-27E7')
    ];

    let unBookmarkData = await Promise.all(unBookmarkPromises);
    console.log(unBookmarkData);

    // let data = await MM.getCourse('DF5D-0000-03B7-E3F3');

    // console.log(data['DF5D-0000-03B7-E3F3'].courseTitle);

//    let bookmarks = await MM.getBookmarks({
//        paged: 1
//    });

//    console.log('BookMarks', bookmarks);
})()
```

## TODO:
Need to still add conditionals for when things go wrong, like wrong course id or not logged in.

## Contribution:
For contribution please open up an issue and follow gitflow workflow practices: https://www.atlassian.com/git/tutorials/comparing-workflows