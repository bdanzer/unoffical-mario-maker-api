"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var cheerio = require("cheerio");
var axios_1 = require("axios");
var qs = require("query-string");
var utils_1 = require("./utils/utils");
var MM = /** @class */ (function () {
    function MM() {
        this.baseUrl = 'https://supermariomakerbookmark.nintendo.net';
        this.bookmarkUrl = 'https://supermariomakerbookmark.nintendo.net/users/auth/nintendo';
        this.courseUrl = 'https://supermariomakerbookmark.nintendo.net/courses';
        this.csrfTokenHeaderName = 'X-CSRF-Token';
        this.sessionCookie = '';
        this.nonce = '';
        this.authenticity = '';
        this.loggedIn = false;
    }
    MM.prototype.getSessionCookie = function (cookies) {
        var CookiesObj = utils_1.getCookieFromArray(cookies);
        return "_supermariomakerbookmark_session=" + CookiesObj['_supermariomakerbookmark_session'];
    };
    MM.prototype.login = function (_a, _callback) {
        var username = _a.username, password = _a.password;
        if (_callback === void 0) { _callback = ''; }
        return __awaiter(this, void 0, void 0, function () {
            var challenge, authUrl, query, bodyFormData, formData, userLogin, e_1, loggedIn, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, axios_1.default({
                            method: "get",
                            url: this.bookmarkUrl,
                            withCredentials: true,
                            maxRedirects: 0,
                            validateStatus: function (status) {
                                return status >= 200 && status < 303;
                            }
                        })];
                    case 1:
                        challenge = _b.sent();
                        /**
                         * Cookie stuff
                         */
                        this.sessionCookie = this.getSessionCookie(challenge.headers['set-cookie']);
                        authUrl = challenge.headers.location;
                        query = qs.parseUrl(authUrl).query;
                        bodyFormData = {
                            'client_id': query.client_id,
                            'state': query.state,
                            'nintendo_authenticate': '',
                            'nintendo_authorize': '',
                            'lang': 'en-US',
                            'username': username,
                            'password': password,
                            'scope': ''
                        };
                        formData = qs.stringify(Object.assign(query, bodyFormData));
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default({
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
                            })];
                    case 3:
                        userLogin = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _b.sent();
                        console.log(e_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, axios_1.default({
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
                            })];
                    case 6:
                        loggedIn = _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        e_2 = _b.sent();
                        console.log(e_2);
                        return [3 /*break*/, 8];
                    case 8:
                        // if (typeof callback === 'function') {
                        //     callback.apply();
                        // }
                        this.loggedIn = true;
                        this.sessionCookie = this.getSessionCookie(loggedIn.headers['set-cookie']);
                        return [2 /*return*/, this];
                }
            });
        });
    };
    MM.prototype.getCourse = function (courseId, _data, callback) {
        if (_data === void 0) { _data = ''; }
        if (callback === void 0) { callback = null; }
        return __awaiter(this, void 0, void 0, function () {
            var htmlResponse, $, courseRecordParts, courseExtraInfo, courseInfo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, axios_1.default.get(this.courseUrl + "/" + courseId, {
                            headers: {
                                Cookie: this.sessionCookie
                            }
                        })];
                    case 1:
                        htmlResponse = _a.sent();
                        $ = cheerio.load(htmlResponse.data, {
                            decodeEntities: false
                        });
                        this.sessionCookie = this.getSessionCookie(htmlResponse.headers['set-cookie']);
                        this.nonce = $('[name="csrf-token"]').attr('content');
                        this.authenticity = $('[name="csrf-param"]').attr('content');
                        courseRecordParts = this.parseTypography($('.fastest-user .clear-time .typography'), $);
                        courseExtraInfo = {
                            'extraInfo': {
                                "worldRecordInfo": {
                                    "worldRecordParts": courseRecordParts,
                                    "worldRecord": courseRecordParts.left + ":" + courseRecordParts.middle + "." + courseRecordParts.right,
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
                        courseInfo = this.getCourseCardInfo($('.course-card'), $);
                        if (typeof callback === 'function') {
                            callback.apply(null, [$, this]);
                        }
                        return [2 /*return*/, Object.assign(courseInfo, courseExtraInfo)];
                }
            });
        });
    };
    MM.prototype.parseTypography = function (types, $) {
        var divided = false;
        var middle = false;
        var obj = {
            'left': '',
            'middle': '',
            'right': ''
        };
        $(types).each(function (_i, typo) {
            var typoEl = $(typo);
            if (typoEl.hasClass('typography-slash') || typoEl.hasClass('typography-second')) {
                divided = true;
                middle = false;
                return true;
            }
            if (typoEl.hasClass('typography-minute')) {
                middle = true;
                return true;
            }
            var classList = typoEl.attr('class').split(" ");
            var numberStr = classList[1].replace('typography-', '');
            if (middle) {
                obj['middle'] = obj['middle'] + numberStr;
                return true;
            }
            (divided) ? obj['right'] = obj['right'] + numberStr : obj['left'] = obj['left'] + numberStr;
        });
        return obj;
    };
    MM.prototype.getCreatorInfo = function (el, $) {
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
    };
    MM.prototype.getCourseCardInfo = function (courseCards, $) {
        var _this = this;
        var courseData = {};
        courseCards.each(function (_i, _courseCard) {
            var cardEl = $(this);
            var courseImg = cardEl.find('.course-image img');
            var courseId = courseImg.attr('alt');
            var triedCount = _this.parseTypography(cardEl.find('.tried-count .typography'), $);
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
    };
    MM.prototype.getBookmarks = function (options) {
        if (options === void 0) { options = null; }
        return __awaiter(this, void 0, void 0, function () {
            var url, bookmarks, e_3, $;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = (options) ? this.baseUrl + "/bookmarks?page=" + options.paged : this.baseUrl + "/bookmarks";
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default({
                                url: url,
                                method: "get",
                                headers: {
                                    Cookie: this.sessionCookie
                                },
                                withCredentials: true
                            })];
                    case 2:
                        bookmarks = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_3 = _a.sent();
                        console.log(e_3);
                        return [3 /*break*/, 4];
                    case 4:
                        this.sessionCookie = this.getSessionCookie(bookmarks.headers['set-cookie']);
                        $ = cheerio.load(bookmarks.data, {
                            decodeEntities: false
                        });
                        return [2 /*return*/, {
                                'totalBookmarked': this.parseTypography('.playlist-top .typography', $).left,
                                'courses': this.getCourseCardInfo($('.course-card'), $),
                                'prevPage': this.getPaginationInfo('.prev', $),
                                'nextPage': this.getPaginationInfo('.next', $),
                                'firstPage': this.getPaginationInfo('.first', $),
                                'lastPage': this.getPaginationInfo('.last', $)
                            }];
                }
            });
        });
    };
    MM.prototype.getPaginationInfo = function (selector, $) {
        var data = '';
        var paginationEl = $(".pagination " + selector);
        if (paginationEl.hasClass('disabled')) {
            data = null;
        }
        else {
            var paginateEl = paginationEl.find('a');
            var url = paginateEl.attr('href');
            var pageNumber = qs.parseUrl(url).query.page;
            data = {
                'url': url,
                'pageNumber': pageNumber
            };
        }
        return data;
    };
    MM.prototype.bookmark = function (courseId) {
        return __awaiter(this, void 0, void 0, function () {
            var courseData, bookmark, e_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCourse(courseId)];
                    case 1:
                        courseData = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default({
                                url: this.courseUrl + "/" + courseId + "/play_at_later",
                                method: "post",
                                headers: (_a = {},
                                    _a[this.csrfTokenHeaderName] = this.nonce,
                                    _a.Cookie = this.sessionCookie,
                                    _a),
                                withCredentials: true
                            })];
                    case 3:
                        bookmark = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_4 = _b.sent();
                        console.log(e_4);
                        return [3 /*break*/, 5];
                    case 5:
                        this.sessionCookie = this.getSessionCookie(bookmark.headers['set-cookie']);
                        return [2 /*return*/, courseData];
                }
            });
        });
    };
    MM.prototype.unBookmark = function (courseId) {
        return __awaiter(this, void 0, void 0, function () {
            var courseData, deleteBookmark, e_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getCourse(courseId)];
                    case 1:
                        courseData = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios_1.default({
                                url: "https://supermariomakerbookmark.nintendo.net/bookmarks/" + courseId,
                                method: "DELETE",
                                headers: (_a = {},
                                    _a[this.csrfTokenHeaderName] = this.nonce,
                                    _a.Cookie = this.sessionCookie,
                                    _a),
                                withCredentials: true
                            })];
                    case 3:
                        deleteBookmark = _b.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_5 = _b.sent();
                        console.log(e_5);
                        return [3 /*break*/, 5];
                    case 5:
                        this.sessionCookie = this.getSessionCookie(deleteBookmark.headers['set-cookie']);
                        return [2 /*return*/, courseData];
                }
            });
        });
    };
    return MM;
}());
exports.default = MM;
