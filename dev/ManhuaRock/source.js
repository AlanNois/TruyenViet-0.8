(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BadgeColor = void 0;
var BadgeColor;
(function (BadgeColor) {
    BadgeColor["BLUE"] = "default";
    BadgeColor["GREEN"] = "success";
    BadgeColor["GREY"] = "info";
    BadgeColor["YELLOW"] = "warning";
    BadgeColor["RED"] = "danger";
})(BadgeColor = exports.BadgeColor || (exports.BadgeColor = {}));

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSectionType = void 0;
var HomeSectionType;
(function (HomeSectionType) {
    HomeSectionType["singleRowNormal"] = "singleRowNormal";
    HomeSectionType["singleRowLarge"] = "singleRowLarge";
    HomeSectionType["doubleRow"] = "doubleRow";
    HomeSectionType["featured"] = "featured";
})(HomeSectionType = exports.HomeSectionType || (exports.HomeSectionType = {}));

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],5:[function(require,module,exports){
"use strict";
/**
 * Request objects hold information for a particular source (see sources for example)
 * This allows us to to use a generic api to make the calls against any source
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlEncodeObject = exports.convertTime = exports.Source = void 0;
/**
* @deprecated Use {@link PaperbackExtensionBase}
*/
class Source {
    constructor(cheerio) {
        this.cheerio = cheerio;
    }
    /**
     * @deprecated use {@link Source.getSearchResults getSearchResults} instead
     */
    searchRequest(query, metadata) {
        return this.getSearchResults(query, metadata);
    }
    /**
     * @deprecated use {@link Source.getSearchTags} instead
     */
    async getTags() {
        // @ts-ignore
        return this.getSearchTags?.();
    }
}
exports.Source = Source;
// Many sites use '[x] time ago' - Figured it would be good to handle these cases in general
function convertTime(timeAgo) {
    let time;
    let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
    trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
    if (timeAgo.includes('minutes')) {
        time = new Date(Date.now() - trimmed * 60000);
    }
    else if (timeAgo.includes('hours')) {
        time = new Date(Date.now() - trimmed * 3600000);
    }
    else if (timeAgo.includes('days')) {
        time = new Date(Date.now() - trimmed * 86400000);
    }
    else if (timeAgo.includes('year') || timeAgo.includes('years')) {
        time = new Date(Date.now() - trimmed * 31556952000);
    }
    else {
        time = new Date(Date.now());
    }
    return time;
}
exports.convertTime = convertTime;
/**
 * When a function requires a POST body, it always should be defined as a JsonObject
 * and then passed through this function to ensure that it's encoded properly.
 * @param obj
 */
function urlEncodeObject(obj) {
    let ret = {};
    for (const entry of Object.entries(obj)) {
        ret[encodeURIComponent(entry[0])] = encodeURIComponent(entry[1]);
    }
    return ret;
}
exports.urlEncodeObject = urlEncodeObject;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentRating = exports.SourceIntents = void 0;
var SourceIntents;
(function (SourceIntents) {
    SourceIntents[SourceIntents["MANGA_CHAPTERS"] = 1] = "MANGA_CHAPTERS";
    SourceIntents[SourceIntents["MANGA_TRACKING"] = 2] = "MANGA_TRACKING";
    SourceIntents[SourceIntents["HOMEPAGE_SECTIONS"] = 4] = "HOMEPAGE_SECTIONS";
    SourceIntents[SourceIntents["COLLECTION_MANAGEMENT"] = 8] = "COLLECTION_MANAGEMENT";
    SourceIntents[SourceIntents["CLOUDFLARE_BYPASS_REQUIRED"] = 16] = "CLOUDFLARE_BYPASS_REQUIRED";
    SourceIntents[SourceIntents["SETTINGS_UI"] = 32] = "SETTINGS_UI";
})(SourceIntents = exports.SourceIntents || (exports.SourceIntents = {}));
/**
 * A content rating to be attributed to each source.
 */
var ContentRating;
(function (ContentRating) {
    ContentRating["EVERYONE"] = "EVERYONE";
    ContentRating["MATURE"] = "MATURE";
    ContentRating["ADULT"] = "ADULT";
})(ContentRating = exports.ContentRating || (exports.ContentRating = {}));

},{}],7:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Source"), exports);
__exportStar(require("./ByteArray"), exports);
__exportStar(require("./Badge"), exports);
__exportStar(require("./interfaces"), exports);
__exportStar(require("./SourceInfo"), exports);
__exportStar(require("./HomeSectionType"), exports);
__exportStar(require("./PaperbackExtensionBase"), exports);

},{"./Badge":1,"./ByteArray":2,"./HomeSectionType":3,"./PaperbackExtensionBase":4,"./Source":5,"./SourceInfo":6,"./interfaces":15}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],15:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./ChapterProviding"), exports);
__exportStar(require("./CloudflareBypassRequestProviding"), exports);
__exportStar(require("./HomePageSectionsProviding"), exports);
__exportStar(require("./MangaProgressProviding"), exports);
__exportStar(require("./MangaProviding"), exports);
__exportStar(require("./RequestManagerProviding"), exports);
__exportStar(require("./SearchResultsProviding"), exports);

},{"./ChapterProviding":8,"./CloudflareBypassRequestProviding":9,"./HomePageSectionsProviding":10,"./MangaProgressProviding":11,"./MangaProviding":12,"./RequestManagerProviding":13,"./SearchResultsProviding":14}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],60:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./DynamicUI/Exports/DUIBinding"), exports);
__exportStar(require("./DynamicUI/Exports/DUIForm"), exports);
__exportStar(require("./DynamicUI/Exports/DUIFormRow"), exports);
__exportStar(require("./DynamicUI/Exports/DUISection"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIHeader"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUILink"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIMultilineLabel"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUINavigationButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIOAuthButton"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISecureInputField"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISelect"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUIStepper"), exports);
__exportStar(require("./DynamicUI/Rows/Exports/DUISwitch"), exports);
__exportStar(require("./Exports/ChapterDetails"), exports);
__exportStar(require("./Exports/Chapter"), exports);
__exportStar(require("./Exports/Cookie"), exports);
__exportStar(require("./Exports/HomeSection"), exports);
__exportStar(require("./Exports/IconText"), exports);
__exportStar(require("./Exports/MangaInfo"), exports);
__exportStar(require("./Exports/MangaProgress"), exports);
__exportStar(require("./Exports/PartialSourceManga"), exports);
__exportStar(require("./Exports/MangaUpdates"), exports);
__exportStar(require("./Exports/PBCanvas"), exports);
__exportStar(require("./Exports/PBImage"), exports);
__exportStar(require("./Exports/PagedResults"), exports);
__exportStar(require("./Exports/RawData"), exports);
__exportStar(require("./Exports/Request"), exports);
__exportStar(require("./Exports/SourceInterceptor"), exports);
__exportStar(require("./Exports/RequestManager"), exports);
__exportStar(require("./Exports/Response"), exports);
__exportStar(require("./Exports/SearchField"), exports);
__exportStar(require("./Exports/SearchRequest"), exports);
__exportStar(require("./Exports/SourceCookieStore"), exports);
__exportStar(require("./Exports/SourceManga"), exports);
__exportStar(require("./Exports/SecureStateManager"), exports);
__exportStar(require("./Exports/SourceStateManager"), exports);
__exportStar(require("./Exports/Tag"), exports);
__exportStar(require("./Exports/TagSection"), exports);
__exportStar(require("./Exports/TrackedMangaChapterReadAction"), exports);
__exportStar(require("./Exports/TrackerActionQueue"), exports);

},{"./DynamicUI/Exports/DUIBinding":17,"./DynamicUI/Exports/DUIForm":18,"./DynamicUI/Exports/DUIFormRow":19,"./DynamicUI/Exports/DUISection":20,"./DynamicUI/Rows/Exports/DUIButton":21,"./DynamicUI/Rows/Exports/DUIHeader":22,"./DynamicUI/Rows/Exports/DUIInputField":23,"./DynamicUI/Rows/Exports/DUILabel":24,"./DynamicUI/Rows/Exports/DUILink":25,"./DynamicUI/Rows/Exports/DUIMultilineLabel":26,"./DynamicUI/Rows/Exports/DUINavigationButton":27,"./DynamicUI/Rows/Exports/DUIOAuthButton":28,"./DynamicUI/Rows/Exports/DUISecureInputField":29,"./DynamicUI/Rows/Exports/DUISelect":30,"./DynamicUI/Rows/Exports/DUIStepper":31,"./DynamicUI/Rows/Exports/DUISwitch":32,"./Exports/Chapter":33,"./Exports/ChapterDetails":34,"./Exports/Cookie":35,"./Exports/HomeSection":36,"./Exports/IconText":37,"./Exports/MangaInfo":38,"./Exports/MangaProgress":39,"./Exports/MangaUpdates":40,"./Exports/PBCanvas":41,"./Exports/PBImage":42,"./Exports/PagedResults":43,"./Exports/PartialSourceManga":44,"./Exports/RawData":45,"./Exports/Request":46,"./Exports/RequestManager":47,"./Exports/Response":48,"./Exports/SearchField":49,"./Exports/SearchRequest":50,"./Exports/SecureStateManager":51,"./Exports/SourceCookieStore":52,"./Exports/SourceInterceptor":53,"./Exports/SourceManga":54,"./Exports/SourceStateManager":55,"./Exports/Tag":56,"./Exports/TagSection":57,"./Exports/TrackedMangaChapterReadAction":58,"./Exports/TrackerActionQueue":59}],61:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./generated/_exports"), exports);
__exportStar(require("./base/index"), exports);
__exportStar(require("./compat/DyamicUI"), exports);

},{"./base/index":7,"./compat/DyamicUI":16,"./generated/_exports":60}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManhuaRock = exports.ManhuaRockInfo = exports.isLastPage = void 0;
const types_1 = require("@paperback/types");
const ManhuaRockParser_1 = require("./ManhuaRockParser");
const DOMAIN = 'https://manhuarockz.com/';
const isLastPage = ($) => {
    const pages = [];
    $("li", "ul.pagination").each((_, page) => {
        const pageNumber = Number($('a', page).text().trim());
        if (!isNaN(pageNumber)) {
            pages.push(pageNumber);
        }
    });
    const lastPage = Math.max(...pages);
    const currentPage = Number($("ul.pagination > .active > a").text().trim());
    return currentPage >= lastPage;
};
exports.isLastPage = isLastPage;
exports.ManhuaRockInfo = {
    version: '1.0.0',
    name: 'ManhuaRock',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois/',
    description: 'Extension that pulls manga from ManhuaRock.',
    contentRating: types_1.ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Recommended',
            type: types_1.BadgeColor.BLUE
        }
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS
};
class ManhuaRock {
    /**
     * The constructor function takes a CheerioAPI object as a parameter and assigns it to a private
     * property.
     * @param {CheerioAPI} cheerio - The `cheerio` parameter is of type `CheerioAPI`. Cheerio is a
     * fast, flexible, and lean implementation of core jQuery designed specifically for the server. It
     * allows you to traverse and manipulate HTML and XML documents using a familiar API inspired by
     * jQuery.
     */
    constructor(cheerio) {
        this.cheerio = cheerio;
        /* The `readonly requestManager` property is creating an instance of the `RequestManager` class
        from the `App` module. */
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 4,
            requestTimeout: 15000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': DOMAIN,
                            'user-agent': await this.requestManager.getDefaultUserAgent(),
                        }
                    };
                    return request;
                },
                interceptResponse: async (response) => {
                    return response;
                }
            }
        });
        this.parser = new ManhuaRockParser_1.Parser();
    }
    getMangaShareUrl(mangaId) {
        return `${DOMAIN}truyen/${mangaId}`;
    }
    /**
     * The function `DOMHTML` is a private asynchronous function that takes a URL as a parameter and
     * returns a Promise that resolves to a CheerioStatic object.
     * @param {string} url - The URL of the HTML page you want to load and parse.
     * @returns a Promise that resolves to a CheerioStatic object.
     */
    async DOMHTML(url) {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(response.data);
    }
    /**
     * The function `getAPI` is a private asynchronous function that makes a GET request to a specified
     * URL and returns the response data as a string.
     * @param {string} url - The `url` parameter is a string that represents the URL of the API
     * endpoint that you want to make a GET request to.
     * @returns a Promise that resolves to a string.
     */
    async getAPI(url) {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return response.data;
    }
    async getMangaDetails(mangaId) {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId}`);
        return this.parser.parseChapterList($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const json = await this.getAPI(`${DOMAIN}ajax/image/list/chap/${chapterId.split('/').pop()}?mode=vertical&quality=high`);
        const $ = this.cheerio.load(JSON.parse(json).html);
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        });
    }
    async getSearchResults(query, metadata) {
        let page = metadata?.page ?? 1;
        const search = {
            genre: '',
            sort: ''
        };
        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        for (const value of tags) {
            if (value.indexOf('.') === -1) {
                search.genre = value;
            }
            else {
                const [_, val] = value.split(".");
                search.sort = String(val);
            }
        }
        const url = `${DOMAIN}${query.title ? 'tim-kiem/' : 'the-loai/'}`;
        const param_1 = encodeURI(`${page}/?keyword=${query.title ?? ''}`);
        const param_2 = encodeURI(`${search.genre}/${page}/${search.sort ? '?sort=' : ''}${search.sort}`);
        const $ = await this.DOMHTML(`${url}${query.title ? param_1 : param_2}`);
        console.log(`${url}${query.title ? param_1 : param_2}`);
        const tiles = this.parser.parseSearchResults($);
        metadata = !(0, exports.isLastPage)($) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: tiles,
            metadata
        });
    }
    async getHomePageSections(sectionCallback) {
        console.log('ManhuaRock Running...');
        const sections = [
            App.createHomeSection({ id: 'featured', title: "Truyện Đề Cử", containsMoreItems: false, type: types_1.HomeSectionType.featured }),
            App.createHomeSection({ id: 'viewest', title: "Truyện Xem Nhiều Nhất", containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_updated', title: "Truyện Mới Cập Nhật", containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'full', title: "Truyện Đã Hoàn Thành", containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
        ];
        for (const section of sections) {
            sectionCallback(section);
            let url;
            switch (section.id) {
                case 'featured':
                    url = `${DOMAIN}`;
                    break;
                case 'viewest':
                    url = `${DOMAIN}xem-nhieu/`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}danh-sach-truyen/?sort=latest-updated`;
                    break;
                case 'full':
                    url = `${DOMAIN}hoan-thanh/`;
                    break;
                default:
                    throw new Error("Invalid homepage section ID");
            }
            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'featured':
                    section.items = this.parser.parseFeaturedSection($);
                    break;
                default:
                    section.items = this.parser.parseSearchResults($);
            }
            sectionCallback(section);
        }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        let page = metadata?.page ?? 1;
        let url = "";
        switch (homepageSectionId) {
            case 'featured':
                url = `${DOMAIN}`;
                break;
            case 'viewest':
                url = `${DOMAIN}xem-nhieu/${page}/`;
                break;
            case 'new_updated':
                url = `${DOMAIN}danh-sach-truyen/${page}/?sort=latest-updated`;
                break;
            case 'full':
                url = `${DOMAIN}hoan-thanh/${page}`;
                break;
            default:
                throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
        }
        const $ = await this.DOMHTML(url);
        let manga = [];
        switch (homepageSectionId) {
            case 'featured':
                manga = this.parser.parseFeaturedSection($);
                break;
            default:
                manga = this.parser.parseSearchResults($);
        }
        metadata = (0, exports.isLastPage)($) ? undefined : { page: page + 1 };
        return App.createPagedResults({
            results: manga,
            metadata
        });
    }
    async getSearchTags() {
        // const url = `${DOMAIN}`;
        // const $ = await this.DOMHTML(url);
        return this.parser.parseTags();
    }
}
exports.ManhuaRock = ManhuaRock;

},{"./ManhuaRockParser":63,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    /**
     * The function `parseMangaDetails` takes in a CheerioStatic object and a mangaId string, and
     * parses the manga details from the object to create and return a SourceManga object.
     * @param {CheerioStatic} $ - The CheerioStatic parameter is a reference to the Cheerio library,
     * which is used for parsing HTML.
     * @param {string} mangaId - The mangaId parameter is a string that represents the unique
     * identifier of a manga. It is used to fetch the details of a specific manga from a source.
     * @returns a SourceManga object.
     */
    parseMangaDetails($, mangaId) {
        const tags = [];
        let author = '';
        let artist = '';
        $('.post-content > .post-content_item').each((_, obj) => {
            switch ($('.summary-heading', obj).text().trim()) {
                case "Tác giả":
                    author = $('.summary-content', obj).text();
                    break;
                case "Hoạ sỹ":
                    artist = $('.summary-content', obj).text();
                    break;
                case "Thể loại":
                    $('.summary-content > .genres-content > a').each((_, tag) => {
                        const label = $(tag).text();
                        const id = $(obj).attr('href')?.split('/').pop() ?? label;
                        tags.push(App.createTag({ label, id }));
                    });
                    break;
            }
        });
        const titles = $('.post-title > h1').text().trim();
        const image = String($('.summary_image > a > img').attr('src'));
        const desc = $('.dsct > p').text();
        const status = $('.post-status > div:nth-child(2) > div.summary-content').text();
        const rating = parseFloat($('span[property="ratingValue"]').text());
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [titles],
                author,
                artist,
                image,
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
                rating: Number.isNaN(rating) ? 0 : rating
            }),
        });
    }
    /**
     * The function `parseChapterList` takes a CheerioStatic object and returns an array of Chapter
     * objects by extracting data from the HTML structure.
     * @param {CheerioStatic} $ - The parameter `$` is a reference to the CheerioStatic object, which
     * is a jQuery-like library for parsing HTML. It is used to select and manipulate elements in the
     * HTML document.
     * @returns an array of Chapter objects.
     */
    parseChapterList($) {
        const chapters = [];
        $('.row-content-chapter > li').each((_, obj) => {
            const id = String($('a', obj).attr('href')?.split('/').slice(4).join('/'));
            const view_n_time = $('span', obj).text().trim().split('-');
            const time = new Date(String(view_n_time[1]));
            const group = view_n_time[0];
            const name = $('a', obj).text();
            const chapNum = $('a', obj).text().split(' ');
            /* The code `chapters.push(App.createChapter({ id, chapNum: parseFloat(String(chapNum)),
            name, langCode: '🇻🇳', time, group }))` is creating a new Chapter object and pushing it
            into the `chapters` array. */
            chapters.push(App.createChapter({
                id,
                chapNum: parseFloat(String(chapNum)),
                name,
                langCode: '🇻🇳',
                time,
                group
            }));
        });
        if (chapters.length == 0) {
            throw new Error('No chapter found');
        }
        return chapters;
    }
    parseChapterDetails($) {
        const pages = [];
        $('.image-placeholder > img').each((_, obj) => {
            if (!obj.attribs['data-src'])
                return;
            const link = obj.attribs['data-src'];
            pages.push(link);
        });
        return pages;
    }
    parseSearchResults($) {
        const tiles = [];
        $('.page-item', '.listupd').each((_, manga) => {
            const title = $('div > div > h3', manga).text().trim();
            const id = $('div > div > h3 > a').attr('href')?.split('/').slice(4).join('/');
            let image = $('div > div > a > img', manga).first().attr('data-src');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            const subtitle = $("div > div > .list-chapter > div:nth-of-type(1) > span", manga).text().trim();
            if (!id || !title)
                return;
            tiles.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: String(image),
                title: title,
                subtitle: subtitle,
            }));
        });
        return tiles;
    }
    parseFeaturedSection($) {
        const featuredItems = [];
        $('.p-item', '.sidebar > div:nth-child(5) > div.sidebar-pp').each((_, manga) => {
            const title = $('.p-left > h4', manga).text().trim();
            const id = $('.p-left > h4 > a').attr('href')?.split('/').slice(4).join('/');
            let image = $('.pthumb > img', manga).first().attr('data-src');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            const subtitle = $(".p-left > .list-chapter > div:nth-of-type(1) > span", manga).first().text().trim();
            if (!id || !title)
                return;
            featuredItems.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: String(image),
                title: title,
                subtitle: subtitle,
            }));
        });
        return featuredItems;
    }
    parseTags() {
        const arrayTags = [
            { id: "yuri", label: "Yuri" },
            { id: "yaoi", label: "Yaoi" },
            { id: "xuyen-sach", label: "Xuyên Sách" },
            { id: "xuyen-nhanh", label: "Xuyên Nhanh" },
            { id: "xuyen-khong", label: "Xuyên Không" },
            { id: "webtoons", label: "Webtoons" },
            { id: "webtoon", label: "Webtoon" },
            { id: "vuong-gia", label: "Vương Gia" },
            { id: "vuon-truong", label: "Vườn Trường" },
            { id: "vo-thuat", label: "Võ Thuật" },
            { id: "vo-hiep", label: "Võ Hiệp" },
            { id: "vien-tuong", label: "Viễn Tưởng" },
            { id: "tu-tien", label: "Tu Tiên" },
            { id: "tu-luyen", label: "Tu Luyện" },
            { id: "truyen-tranh", label: "Truyện Tranh" },
            { id: "truyen-nhat-manga", label: "Truyện Nhật (Manga)" },
            { id: "truyen-nam", label: "Truyện Nam" },
            { id: "truyen-mau", label: "Truyện Màu" },
            { id: "truyen-ma", label: "Truyện Ma" },
            { id: "trung-sinh", label: "Trùng Sinh" },
            { id: "trong-sinh", label: "Trọng Sinh" },
            { id: "trinh-tham", label: "Trinh Thám" },
            { id: "tragedy", label: "Tragedy" },
            { id: "tra-thu", label: "Trả Thù" },
            { id: "tong-tai", label: "Tổng Tài" },
            { id: "tinh-yeu", label: "Tình Yêu" },
            { id: "tinh-cam", label: "Tình Cảm" },
            { id: "thuan-phuc-thu", label: "Thuần Phục Thú" },
            { id: "thieu-nhi", label: "Thiếu Nhi" },
            { id: "thien-tai", label: "Thiên Tài" },
            { id: "the-thao", label: "Thể Thao" },
            { id: "thanh-xuan-vuon-truong", label: "Thanh Xuân Vườn Trường" },
            { id: "thanh-xuan", label: "Thanh Xuân" },
            { id: "thai-giam", label: "Thái Giám" },
            { id: "tap-chi-truyen-t", label: "Tạp Chí Truyện T" },
            { id: "supernatural", label: "Supernatural" },
            { id: "sung-vat", label: "Sủng Vật" },
            { id: "sung", label: "Sủng" },
            { id: "sports", label: "Sports" },
            { id: "soft-yuri", label: "Soft Yuri" },
            { id: "smut", label: "Smut" },
            { id: "slice-of-life", label: "Slice of life" },
            { id: "sieu-nhien", label: "Siêu Nhiên" },
            { id: "showbiz", label: "Showbiz" },
            { id: "shounen-ai", label: "Shounen Ai" },
            { id: "shounen", label: "Shounen" },
            { id: "shoujo-ai", label: "Shoujo Ai" },
            { id: "shoujo", label: "Shoujo" },
            { id: "series", label: "Series" },
            { id: "seinen", label: "Seinen" },
            { id: "sci-fi", label: "Sci-Fi" },
            { id: "school-life", label: "School Life" },
            { id: "sang-van", label: "Sảng Văn" },
            { id: "san-ban", label: "Săn Bắn" },
            { id: "romance", label: "Romance" },
            { id: "quai-vat", label: "Quái Vật" },
            { id: "psychological", label: "Psychological" },
            { id: "phieu-luu", label: "Phiêu Lưu" },
            { id: "phep-thuat", label: "Phép Thuật" },
            { id: "phap-y", label: "Pháp Y" },
            { id: "phan-dien", label: "Phản Diện" },
            { id: "one-shot", label: "One Shot" },
            { id: "nu-phu", label: "Nữ Phụ" },
            { id: "nu-gia-nam", label: "Nữ Giả Nam" },
            { id: "nu-cuong", label: "Nữ Cường" },
            { id: "nhiet-huyet", label: "Nhiệt Huyết" },
            { id: "nguoi-lon", label: "Người Lớn" },
            { id: "nguoc", label: "Ngược" },
            { id: "ngu-thu", label: "Ngự Thú" },
            { id: "ngot-sung", label: "Ngọt Sủng" },
            { id: "ngon-tu-nhay-cam", label: "Ngôn Từ Nhạy Cảm" },
            { id: "ngon-tinh", label: "Ngôn Tình" },
            { id: "ngon-t", label: "Ngôn T" },
            { id: "net-dep", label: "Nét Đẹp" },
            { id: "nau-an", label: "Nấu Ăn" },
            { id: "mystery", label: "Mystery" },
            { id: "murim", label: "Murim" },
            { id: "mecha", label: "Mecha" },
            { id: "mature", label: "Mature" },
            { id: "mat-the", label: "Mạt Thế" },
            { id: "martial-arts", label: "Martial Arts" },
            { id: "mao-hiem", label: "Mạo Hiểm" },
            { id: "manhwa", label: "Manhwa" },
            {
                id: "manhua-ngon-tinh-thanh-xuan-vuon-truong",
                label: "Manhua; Ngôn Tình; Thanh Xuân Vườn Trường"
            },
            { id: "manhua", label: "Manhua" },
            { id: "manga", label: "Manga" },
            { id: "magic", label: "Magic" },
            { id: "magi", label: "Magi" },
            { id: "luan-hoi", label: "Luân Hồi" },
            { id: "live-action", label: "Live Action" },
            { id: "linh-di", label: "Linh Dị" },
            { id: "lich-su", label: "Lịch Sử" },
            { id: "lgbt", label: "Lgbt+" },
            { id: "leo-thap", label: "Leo Tháp" },
            { id: "lang-man", label: "Lãng Mạn" },
            { id: "ky-ao", label: "Kỳ Ảo" },
            { id: "kinh-di", label: "Kinh Dị" },
            { id: "kiem-hiep", label: "Kiếm Hiệp" },
            { id: "kich-tinh", label: "Kịch Tính." },
            { id: "khong-gian", label: "Không Gian" },
            { id: "khong-che", label: "Không Che" },
            { id: "khoa-hoc", label: "Khoa Học" },
            { id: "josei", label: "Josei" },
            { id: "isekai", label: "Isekai" },
            { id: "huyen-huyen", label: "Huyền Huyễn" },
            { id: "huyen-bi", label: "Huyền Bí" },
            { id: "horror", label: "Horror" },
            { id: "hoc-duong", label: "Học Đường" },
            { id: "hoang-cung", label: "Hoàng Cung" },
            { id: "historical", label: "Historical" },
            { id: "hien-dai", label: "Hiện Đại" },
            { id: "hentaiz", label: "Hentaiz" },
            { id: "hentai", label: "Hentai" },
            { id: "he-thong", label: "Hệ thống" },
            { id: "hau-cung", label: "Hậu Cung" },
            { id: "harem", label: "Harem" },
            { id: "hao-mon-the-gia", label: "Hào Môn Thế Gia" },
            { id: "hanh-dong", label: "Hành Động" },
            { id: "hanh", label: "Hành" },
            { id: "ham-nguc", label: "Hầm Ngục" },
            { id: "hai-huoc", label: "Hài Hước." },
            { id: "hai-huoc", label: "Hài Hước" },
            { id: "h", label: "H" },
            { id: "gioi-giai-tri", label: "Giới Giải Trí" },
            { id: "gender-bender", label: "Gender Bender" },
            { id: "game", label: "Game" },
            { id: "full-color", label: "Full Color" },
            { id: "fantasy", label: "Fantasy" },
            { id: "ep-hon", label: "Ép Hôn" },
            { id: "em-gai-no", label: "Em Gái Nô" },
            { id: "ecchi", label: "Ecchi" },
            { id: "do-thi", label: "Đô Thị" },
            { id: "dich-nu", label: "Đích Nữ" },
            { id: "dao-si", label: "Đạo Sĩ" },
            { id: "dam-my", label: "Đam Mỹ" },
            { id: "dai-nu-chu", label: "Đại Nữ Chủ" },
            { id: "dai-lao", label: "Đại Lão" },
            { id: "du-hanh-thoi-gian", label: "Du Hành Thời Gian" },
            { id: "drama", label: "Drama" },
            { id: "doujinshi", label: "Doujinshi" },
            { id: "di-toc", label: "Dị Tộc" },
            { id: "di-nang", label: "Dị Năng" },
            { id: "di-gioi", label: "Dị Giới" },
            { id: "detective", label: "Detective" },
            { id: "cuoi-truoc-yeu-sau", label: "Cưới Trước Yêu Sau" },
            { id: "cung-dau", label: "Cung Đấu" },
            { id: "cooking", label: "Cooking" },
            { id: "comic", label: "Comic" },
            { id: "comedy", label: "Comedy" },
            { id: "co-trang", label: "Cổ Trang" },
            { id: "co-dai", label: "Cổ Đại" },
            { id: "co", label: "Cổ" },
            { id: "chuyen-sinh", label: "Chuyển Sinh" },
            { id: "boylove", label: "BoyLove" },
            { id: "bi-kich", label: "Bi Kịch" },
            { id: "benh-kieu", label: "Bệnh Kiều" },
            { id: "beeng-net", label: "Beeng.net" },
            { id: "bathutong", label: "Bathutong" },
            { id: "bao-thu", label: "Báo Thù" },
            { id: "bao-luc", label: "Bạo Lực" },
            { id: "bach-hop", label: "Bách Hợp" },
            { id: "ba-dao", label: "Bá Đạo" },
            { id: "au-co", label: "Âu Cổ" },
            { id: "anime", label: "Anime" },
            { id: "adventure", label: "Adventure" },
            {
                id: "adult-ecchi-fantasy-harem-manhua-truyen-mau-webtoon",
                label: "Adult - Ecchi - Fantasy - Harem - Manhua - Truyện Màu - Webtoon"
            },
            { id: "adult", label: "Adult" },
            { id: "adaptation", label: "Adaptation" },
            {
                id: "action-manhua-webtoon-truyen-mau-he-thong",
                label: "Action   Manhua   Webtoon   Truyện Màu   Hệ Thống"
            },
            { id: "action", label: "Action" },
            { id: "18", label: "18+" },
            { id: "16", label: "16+" }
        ];
        const arrayTags2 = [
            {
                id: 'sort.latest-updated',
                label: 'Mới cập nhật'
            },
            {
                id: 'sort.score',
                label: 'Điểm'
            },
            {
                id: 'sort.name-az',
                label: 'Tên A-Z'
            },
            {
                id: 'sort.release-date',
                label: 'Ngày Phát Hành'
            },
            {
                id: 'sort.most-viewd',
                label: 'Xem Nhiều'
            }
        ];
        // console.log('huh?')
        // $('.sub-menu > ul > li').each((_: any, tag: any) => {
        //     const label = $('a', tag).text().trim();
        //     const id = $('a', tag).attr('href').split('/').pop() ?? label;
        //     if (!id || !label) return;
        //     arrayTags.push({ id: id, label: label });
        // })
        const tagSections = [
            App.createTagSection({ id: '0', label: 'Thể Loại (Chọn 1)', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Sắp xếp theo (Chỉ chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
        ];
        return tagSections;
    }
}
exports.Parser = Parser;

},{}]},{},[62])(62)
});
