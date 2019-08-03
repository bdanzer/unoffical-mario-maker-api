export function getCookieFromArray(cookieString:any) {
    let cookieParts = '';

    if (Array.isArray(cookieString)) {
        cookieString.forEach(cookiePart => {
            cookieParts += ('-1' !== cookiePart.indexOf(';')) ? `${cookiePart};` : cookiePart;  
        });
    }

    return cookieParser(cookieParts);
}

export function cookieParser(cookieString) {
    var test = cookieString.split(';');  
    var cookiesObj = {};

    test.forEach(kv => {
        var blah = kv.split('=');

        if (blah[1]) {
            cookiesObj[blah[0].trim()] = blah[1].trim()
        }
    });

    return cookiesObj;
}