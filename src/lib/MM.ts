import * as cheerio from 'cheerio';
import axios from 'axios';
import * as qs from 'query-string';
import { getCookieFromArray } from './utils/utils';

class MM {
    baseUrl: string            = 'https://supermariomakerbookmark.nintendo.net';
    bookmarkUrl:string         = 'https://supermariomakerbookmark.nintendo.net/users/auth/nintendo';
    courseUrl:string           = 'https://supermariomakerbookmark.nintendo.net/courses';
    csrfTokenHeaderName:string = 'X-CSRF-Token';
    sessionCookie:string       = '';
    nonce:string               = '';
    authenticity:string        = '';
    loggedIn:boolean           = false;

    constructor() {}
    
    private getSessionCookie(cookies:any) {
        let CookiesObj = getCookieFromArray(cookies);
        return `_supermariomakerbookmark_session=${CookiesObj['_supermariomakerbookmark_session']}`;
    }

    async login({ username, password }, _callback = '') {
        var challenge = await axios({
            method: "get",
            url: this.bookmarkUrl,
            withCredentials: true,
            maxRedirects: 0,
            validateStatus: function(status) {
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
        }
        
        var formData = qs.stringify(Object.assign(query, bodyFormData));

        /**
         * Logging in
         */
        try {
            var userLogin = await axios({
                url: "https://id.nintendo.net/oauth/authorize",
                method: 'post',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                data: formData,
                maxRedirects: 0,
                validateStatus: function(status) {
                    return status >= 200 && status <= 303;
                }
            });
        } catch (e) {
            console.log(e);
        }

        try {
            var loggedIn = await axios({
                url: userLogin.headers.location,
                method: "get",
                headers: {
                    "Cookie": this.sessionCookie
                },
                withCredentials: true,
                maxRedirects: 0,
                validateStatus: function(status) {
                    /**
                     * Having a 500 is ok here
                     */
                    return status == 500;
                }
            });
        } catch(e) {
            console.log(e);
        }

        // if (typeof callback === 'function') {
        //     callback.apply();
        // }

        this.loggedIn = true;
        this.sessionCookie = this.getSessionCookie(loggedIn.headers['set-cookie']);

        return this;
    }

    async getCourse(courseId, _data = '', callback = null) {
        var htmlResponse = await axios.get(`${this.courseUrl}/${courseId}`, {
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

        let courseRecordParts  = this.parseTypography($('.fastest-user .clear-time .typography'), $)
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
    }

    private parseTypography(types, $) {
        var divided = false;
        var middle = false;

        var obj = {
            'left': '',
            'middle': '',
            'right': ''
        };

        $(types).each(function(_i, typo) {
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

    private getCreatorInfo(el, $) {
        var creators = [];

        el.each(function(_i, creatorWrap) {
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

    private getCourseCardInfo(courseCards, $) {
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

    async getBookmarks(options = null) {
        let url = (options) ? `${this.baseUrl}/bookmarks?page=${options.paged}` : `${this.baseUrl}/bookmarks`;

        try {
            var bookmarks = await axios({
                url: url,
                method: "get",
                headers: {
                    Cookie: this.sessionCookie
                },
                withCredentials: true
            })
        } catch(e) {
            console.log(e);
        }

        this.sessionCookie = this.getSessionCookie(bookmarks.headers['set-cookie']);

        const $ = cheerio.load(bookmarks.data, {
            decodeEntities: false
        });

        return {
            'totalBookmarked': this.parseTypography('.playlist-top .typography' , $).left,
            'courses': this.getCourseCardInfo($('.course-card'), $),
            'prevPage': this.getPaginationInfo('.prev', $),
            'nextPage': this.getPaginationInfo('.next', $),
            'firstPage': this.getPaginationInfo('.first', $),
            'lastPage': this.getPaginationInfo('.last', $)
        };
    }

    private getPaginationInfo(selector, $) {
        var data: any = '';
        let paginationEl = $(`.pagination ${selector}`);
        
        if (paginationEl.hasClass('disabled')) {
            data = null;
        } else {
            let paginateEl = paginationEl.find('a');
            let url = paginateEl.attr('href');
            let pageNumber = qs.parseUrl(url).query.page;

            data = {
                'url': url,
                'pageNumber': pageNumber
            }
        }

        return data;
    }

    async bookmark(courseId) {
        let courseData = await this.getCourse(courseId);

        try {
            var bookmark = await axios({
                url: `${this.courseUrl}/${courseId}/play_at_later`,
                method: "post",
                headers: {
                    [this.csrfTokenHeaderName]: this.nonce,
                    Cookie: this.sessionCookie
                },
                withCredentials: true
            })
        } catch(e) {
            console.log(e);
        }

        this.sessionCookie = this.getSessionCookie(bookmark.headers['set-cookie']);

        return courseData;
    }

    async unBookmark(courseId) {
        let courseData = await this.getCourse(courseId);

        try {
            var deleteBookmark = await axios({
                url: `https://supermariomakerbookmark.nintendo.net/bookmarks/${courseId}`,
                method: "DELETE",
                headers: {
                    [this.csrfTokenHeaderName]: this.nonce,
                    Cookie: this.sessionCookie
                },
                withCredentials: true
            })
        } catch(e) {
            console.log(e);
        }

        this.sessionCookie = this.getSessionCookie(deleteBookmark.headers['set-cookie']);

        return courseData;
    }
}

export default MM;