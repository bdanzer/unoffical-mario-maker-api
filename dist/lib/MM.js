"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = require("cheerio");
const axios_1 = require("axios");
const qs = require("query-string");
const utils_1 = require("./utils/utils");
class MM {
    constructor() {
        this.baseUrl = 'https://supermariomakerbookmark.nintendo.net';
        this.bookmarkUrl = 'https://supermariomakerbookmark.nintendo.net/users/auth/nintendo';
        this.courseUrl = 'https://supermariomakerbookmark.nintendo.net/courses';
        this.csrfTokenHeaderName = 'X-CSRF-Token';
        this.sessionCookie = '';
        this.nonce = '';
        this.authenticity = '';
        this.loggedIn = false;
    }
    getSessionCookie(cookies) {
        let CookiesObj = utils_1.getCookieFromArray(cookies);
        return `_supermariomakerbookmark_session=${CookiesObj['_supermariomakerbookmark_session']}`;
    }
    login({ username, password }, _callback = '') {
        return __awaiter(this, void 0, void 0, function* () {
            var challenge = yield axios_1.default({
                method: "get",
                url: this.bookmarkUrl,
                withCredentials: true,
                maxRedirects: 0,
                validateStatus: function (status) {
                    return status >= 200 && status < 303;
                }
            });
            /**
             * Cookie stuff
             */
            this.sessionCookie = this.getSessionCookie(challenge.headers['set-cookie']);
            var authUrl = challenge.headers.location;
            var query = qs.parseUrl(authUrl).query;
            var bodyFormData = {
                'client_id': query.client_id,
                'state': query.state,
                'nintendo_authenticate': '',
                'nintendo_authorize': '',
                'lang': 'en-US',
                'username': username,
                'password': password,
                'scope': ''
            };
            var formData = qs.stringify(Object.assign(query, bodyFormData));
            /**
             * Logging in
             */
            try {
                var userLogin = yield axios_1.default({
                    url: "https://id.nintendo.net/oauth/authorize",
                    method: 'post',
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    data: formData,
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        return status >= 200 && status <= 303;
                    }
                });
            }
            catch (e) {
                console.log(e);
            }
            try {
                var loggedIn = yield axios_1.default({
                    url: userLogin.headers.location,
                    method: "get",
                    headers: {
                        "Cookie": this.sessionCookie
                    },
                    withCredentials: true,
                    maxRedirects: 0,
                    validateStatus: function (status) {
                        /**
                         * Having a 500 is ok here
                         */
                        return status == 500;
                    }
                });
            }
            catch (e) {
                console.log(e);
            }
            // if (typeof callback === 'function') {
            //     callback.apply();
            // }
            this.loggedIn = true;
            this.sessionCookie = this.getSessionCookie(loggedIn.headers['set-cookie']);
            return this;
        });
    }
    getCourse(courseId, _data = '', callback = null) {
        return __awaiter(this, void 0, void 0, function* () {
            var htmlResponse = yield axios_1.default.get(`${this.courseUrl}/${courseId}`, {
                headers: {
                    Cookie: this.sessionCookie
                }
            });
            const $ = cheerio.load(htmlResponse.data, {
                decodeEntities: false
            });
            this.sessionCookie = this.getSessionCookie(htmlResponse.headers['set-cookie']);
            this.nonce = $('[name="csrf-token"]').attr('content');
            this.authenticity = $('[name="csrf-param"]').attr('content');
            let courseRecordParts = this.parseTypography($('.fastest-user .clear-time .typography'), $);
            let courseExtraInfo = {
                'extraInfo': {
                    "worldRecordInfo": {
                        "worldRecordParts": courseRecordParts,
                        "worldRecord": `${courseRecordParts.left}:${courseRecordParts.middle}.${courseRecordParts.right}`,
                        "userInfo": this.getCreatorInfo($('.fastest-user .user-wrapper'), $)
                    },
                    "firstClearInfo": {
                        "userInfo": this.getCreatorInfo($('.first-user'), $)
                    },
                    "recentPlayers": this.getCreatorInfo($('.played-body .user-info-wrapper'), $),
                    "clearedBy": this.getCreatorInfo($('.cleared-body .user-info-wrapper'), $),
                    "starredBy": this.getCreatorInfo($('.liked-body .user-info-wrapper'), $)
                }
            };
            let courseInfo = this.getCourseCardInfo($('.course-card'), $);
            if (typeof callback === 'function') {
                callback.apply(null, [$, this]);
            }
            return Object.assign(courseInfo, courseExtraInfo);
        });
    }
    parseTypography(types, $) {
        var divided = false;
        var middle = false;
        var obj = {
            'left': '',
            'middle': '',
            'right': ''
        };
        $(types).each(function (_i, typo) {
            let typoEl = $(typo);
            if (typoEl.hasClass('typography-slash') || typoEl.hasClass('typography-second')) {
                divided = true;
                middle = false;
                return true;
            }
            if (typoEl.hasClass('typography-minute')) {
                middle = true;
                return true;
            }
            let classList = typoEl.attr('class').split(" ");
            let numberStr = classList[1].replace('typography-', '');
            if (middle) {
                obj['middle'] = obj['middle'] + numberStr;
                return true;
            }
            (divided) ? obj['right'] = obj['right'] + numberStr : obj['left'] = obj['left'] + numberStr;
        });
        return obj;
    }
    getCreatorInfo(el, $) {
        var creators = [];
        el.each(function (_i, creatorWrap) {
            creatorWrap = $(creatorWrap);
            creators.push({
                "name": creatorWrap.find('.name').text(),
                "flag": creatorWrap.find('.flag').attr('class').split(' ')[1],
                "profileLink": creatorWrap.find('.mii-wrapper #mii').attr('href'),
                "miiIcon": creatorWrap.find('.mii-wrapper #mii img').attr('src')
            });
        });
        return (el.length === 1) ? creators[0] : creators;
    }
    getCourseCardInfo(courseCards, $) {
        var _this = this;
        let courseData = {};
        courseCards.each(function (_i, _courseCard) {
            let cardEl = $(this);
            let courseImg = cardEl.find('.course-image img');
            let courseId = courseImg.attr('alt');
            let triedCount = _this.parseTypography(cardEl.find('.tried-count .typography'), $);
            courseData[courseId] = {
                "courseId": courseId,
                "courseTitle": cardEl.find('.course-title').text(),
                "game": cardEl.find('.gameskin').attr('class').split(' ')[2].replace('common_gs_', ''),
                "courseCreated": cardEl.find('.created_at').text(),
                "courseTag": cardEl.find('.course-tag').text(),
                "courseImg": courseImg.attr('src'),
                "courseDifficulty": cardEl.find('.course-header').text().trim(),
                "clearRate": (parseInt(triedCount.left) / parseInt(triedCount.right) * 100).toFixed(2) + '%',
                "courseImgFull": cardEl.find('.course-image-full-wrapper img').attr('src'),
                "triedCount": triedCount,
                "likedCount": _this.parseTypography(cardEl.find('.liked-count .typography'), $).left,
                "playedCount": _this.parseTypography(cardEl.find('.played-count .typography'), $).left,
                "sharedCount": _this.parseTypography(cardEl.find('.shared-count .typography'), $).left,
                "creatorInfo": _this.getCreatorInfo(cardEl.find('.course-detail-wrapper'), $)
            };
        });
        return courseData;
    }
    getBookmarks(options = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let url = (options) ? `${this.baseUrl}/bookmarks?page=${options.paged}` : `${this.baseUrl}/bookmarks`;
            try {
                var bookmarks = yield axios_1.default({
                    url: url,
                    method: "get",
                    headers: {
                        Cookie: this.sessionCookie
                    },
                    withCredentials: true
                });
            }
            catch (e) {
                console.log(e);
            }
            this.sessionCookie = this.getSessionCookie(bookmarks.headers['set-cookie']);
            const $ = cheerio.load(bookmarks.data, {
                decodeEntities: false
            });
            return {
                'totalBookmarked': this.parseTypography('.playlist-top .typography', $).left,
                'courses': this.getCourseCardInfo($('.course-card'), $),
                'prevPage': this.getPaginationInfo('.prev', $),
                'nextPage': this.getPaginationInfo('.next', $),
                'firstPage': this.getPaginationInfo('.first', $),
                'lastPage': this.getPaginationInfo('.last', $)
            };
        });
    }
    getPaginationInfo(selector, $) {
        var data = '';
        let paginationEl = $(`.pagination ${selector}`);
        if (paginationEl.hasClass('disabled')) {
            data = null;
        }
        else {
            let paginateEl = paginationEl.find('a');
            let url = paginateEl.attr('href');
            let pageNumber = qs.parseUrl(url).query.page;
            data = {
                'url': url,
                'pageNumber': pageNumber
            };
        }
        return data;
    }
    bookmark(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            let courseData = yield this.getCourse(courseId);
            try {
                var bookmark = yield axios_1.default({
                    url: `${this.courseUrl}/${courseId}/play_at_later`,
                    method: "post",
                    headers: {
                        [this.csrfTokenHeaderName]: this.nonce,
                        Cookie: this.sessionCookie
                    },
                    withCredentials: true
                });
            }
            catch (e) {
                console.log(e);
            }
            this.sessionCookie = this.getSessionCookie(bookmark.headers['set-cookie']);
            return courseData;
        });
    }
    unBookmark(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            let courseData = yield this.getCourse(courseId);
            try {
                var deleteBookmark = yield axios_1.default({
                    url: `https://supermariomakerbookmark.nintendo.net/bookmarks/${courseId}`,
                    method: "DELETE",
                    headers: {
                        [this.csrfTokenHeaderName]: this.nonce,
                        Cookie: this.sessionCookie
                    },
                    withCredentials: true
                });
            }
            catch (e) {
                console.log(e);
            }
            this.sessionCookie = this.getSessionCookie(deleteBookmark.headers['set-cookie']);
            return courseData;
        });
    }
}
exports.default = new MM();
