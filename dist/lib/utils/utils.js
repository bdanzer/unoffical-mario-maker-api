"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getCookieFromArray(cookieString) {
    let cookieParts = '';
    if (Array.isArray(cookieString)) {
        cookieString.forEach(cookiePart => {
            cookieParts += ('-1' !== cookiePart.indexOf(';')) ? `${cookiePart};` : cookiePart;
        });
    }
    return cookieParser(cookieParts);
}
exports.getCookieFromArray = getCookieFromArray;
function cookieParser(cookieString) {
    var test = cookieString.split(';');
    var cookiesObj = {};
    test.forEach(kv => {
        var blah = kv.split('=');
        if (blah[1]) {
            cookiesObj[blah[0].trim()] = blah[1].trim();
        }
    });
    return cookiesObj;
}
exports.cookieParser = cookieParser;
