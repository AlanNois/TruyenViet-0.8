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
exports.LuotTruyen = exports.LuotTruyenInfo = exports.isLastPage = void 0;
const types_1 = require("@paperback/types");
const LuotTruyenParser_1 = require("./LuotTruyenParser");
const LuotTruyenSetting_1 = require("./LuotTruyenSetting");
const isLastPage = ($) => {
    const lastPage = Number($('ul.pagination > li.page-item:not(:has(a[rel=\'next\'])) a').last().text().trim());
    const currentPage = Number($('ul.pagination > li.active').text().trim());
    return currentPage >= lastPage;
};
exports.isLastPage = isLastPage;
exports.LuotTruyenInfo = {
    version: '1.0.1',
    name: 'LuotTruyen',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from LuotTruyen',
    contentRating: types_1.ContentRating.MATURE,
    websiteBaseURL: 'https://luottruyen7.com',
    sourceTags: [
        {
            text: 'Vietnamese',
            type: types_1.BadgeColor.BLUE,
        },
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.SETTINGS_UI | types_1.SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
};
class LuotTruyen {
    constructor(cheerio) {
        this.cheerio = cheerio;
        this.stateManager = App.createSourceStateManager();
        this.parser = new LuotTruyenParser_1.Parser();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 3,
            requestTimeout: 20000,
            interceptor: {
                interceptRequest: async (request) => {
                    request.headers = {
                        ...(request.headers ?? {}),
                        ...{
                            'referer': `${await this.getBaseUrl()}/`,
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
    }
    async getBaseUrl() {
        return (0, LuotTruyenSetting_1.getDomain)(this.stateManager);
    }
    async getSourceMenu() {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => [
                (0, LuotTruyenSetting_1.domainSettings)(this.stateManager),
                (0, LuotTruyenSetting_1.resetSettings)(this.stateManager),
            ],
            isHidden: false,
        });
    }
    getMangaShareUrl(mangaId) {
        return `${this.getBaseUrl()}/truyen-tranh/${mangaId}`;
    }
    async DOMHTML(url) {
        const request = App.createRequest({ url, method: 'GET' });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        return this.cheerio.load(response.data);
    }
    async DOMPOST(path, body) {
        const baseUrl = await this.getBaseUrl();
        const formBody = Object.entries(body)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
        const request = App.createRequest({
            url: `${baseUrl}${path}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest',
            },
            data: formBody,
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        return this.cheerio.load(response.data);
    }
    async getMangaDetails(mangaId) {
        const baseUrl = await this.getBaseUrl();
        console.log(`${baseUrl}/truyen-tranh/${mangaId}`);
        const $ = await this.DOMHTML(`${baseUrl}/truyen-tranh/${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }
    async getChapters(mangaId) {
        // storyId is the numeric suffix after the last hyphen, e.g. "slug-12345" → "12345"
        const storyId = mangaId.split('-').pop() ?? '';
        const $ = await this.DOMPOST('/Story/ListChapterByStoryID', { StoryID: storyId });
        return this.parser.parseChapterList($);
    }
    async getChapterDetails(mangaId, chapterId) {
        const baseUrl = await this.getBaseUrl();
        const $ = await this.DOMHTML(`${baseUrl}/truyen-tranh/${chapterId}`);
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({ id: chapterId, mangaId, pages });
    }
    async getSearchResults(query, metadata) {
        const page = metadata?.page ?? 1;
        const search = {
            cate: '',
            status: '-1',
            sort: '10',
        };
        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        for (const value of tags) {
            const [key, val] = value.split('.');
            switch (key) {
                case 'cate':
                    search.cate = String(val);
                    break;
                case 'status':
                    search.status = String(val);
                    break;
                case 'sort':
                    search.sort = String(val);
                    break;
            }
        }
        const baseUrl = await this.getBaseUrl();
        const url = `${baseUrl}/tim-truyen`;
        const search_query = !query.title ? '' : `?keyword=${encodeURIComponent(query.title)}`;
        const param = !search_query
            ? `/${search.cate}?sort=${search.sort}&status=${search.status}&page=${page}`
            : `${search_query}&page=${page}`;
        const $ = await this.DOMHTML(`${url}${param}`);
        const tiles = this.parser.parseSearchResults($);
        metadata = (0, exports.isLastPage)($) ? undefined : { page: page + 1 };
        return App.createPagedResults({ results: tiles, metadata });
    }
    async getHomePageSections(sectionCallback) {
        const baseUrl = await this.getBaseUrl();
        const sections = [
            App.createHomeSection({ id: 'popular', title: 'TRUYỆN PHỔ BIẾN', containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'latest', title: 'MỚI CẬP NHẬT', containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'full', title: 'TRUYỆN ĐÃ HOÀN THÀNH', containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
        ];
        for (const section of sections) {
            sectionCallback(section);
            let url;
            switch (section.id) {
                case 'popular':
                    url = `${baseUrl}/tim-truyen?status=-1&sort=10`;
                    break;
                case 'latest':
                    url = `${baseUrl}/?page=1&typegroup=0`;
                    break;
                case 'full':
                    url = `${baseUrl}/tim-truyen?status=2&sort=10`;
                    break;
                default: throw new Error('Invalid home section ID');
            }
            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'popular':
                case 'full':
                    section.items = this.parser.parseSearchResults($);
                    break;
                case 'latest':
                    section.items = this.parser.parseLatestItems($);
                    break;
            }
            sectionCallback(section);
        }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        const page = metadata?.page ?? 1;
        const baseUrl = await this.getBaseUrl();
        let url;
        switch (homepageSectionId) {
            case 'popular':
                url = `${baseUrl}/tim-truyen?status=-1&sort=10&page=${page}`;
                break;
            case 'latest':
                url = `${baseUrl}/?page=${page}&typegroup=0`;
                break;
            case 'full':
                url = `${baseUrl}/tim-truyen?status=2&sort=10&page=${page}`;
                break;
            default: throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist');
        }
        const $ = await this.DOMHTML(url);
        const manga = this.parser.parseViewMoreItems($, homepageSectionId);
        metadata = (0, exports.isLastPage)($) ? undefined : { page: page + 1 };
        return App.createPagedResults({ results: manga, metadata });
    }
    async getSearchTags() {
        const baseUrl = await this.getBaseUrl();
        const $ = await this.DOMHTML(`${baseUrl}/tim-truyen`);
        return this.parser.parseTags($);
    }
    CloudFlareError(status) {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to home page ${LuotTruyen.name} source and press the cloud icon.`);
        }
    }
    async getCloudflareBypassRequestAsync() {
        const baseUrl = await this.getBaseUrl();
        return App.createRequest({
            url: baseUrl,
            method: 'GET',
            headers: {
                'referer': `${baseUrl}/`,
                'origin': `${baseUrl}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent(),
            }
        });
    }
}
exports.LuotTruyen = LuotTruyen;

},{"./LuotTruyenParser":63,"./LuotTruyenSetting":64,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    convertTime(timeAgo) {
        let time;
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = (trimmed == 0 && timeAgo.includes('a')) ? 1 : trimmed;
        if (timeAgo.includes('giây') || timeAgo.includes('secs')) {
            time = new Date(Date.now() - trimmed * 1000);
        }
        else if (timeAgo.includes('phút')) {
            time = new Date(Date.now() - trimmed * 60000);
        }
        else if (timeAgo.includes('giờ')) {
            time = new Date(Date.now() - trimmed * 3600000);
        }
        else if (timeAgo.includes('ngày')) {
            time = new Date(Date.now() - trimmed * 86400000);
        }
        else if (timeAgo.includes('tuần')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7);
        }
        else if (timeAgo.includes('tháng')) {
            time = new Date(Date.now() - trimmed * 86400000 * 7 * 4);
        }
        else if (timeAgo.includes('năm')) {
            time = new Date(Date.now() - trimmed * 31556952000);
        }
        else {
            if (timeAgo.includes(':')) {
                const split = timeAgo.split(' ');
                const H = split[0];
                const D = split[1];
                const fixD = D?.split('/');
                const finalD = fixD?.[1] + '/' + fixD?.[0] + '/' + new Date().getFullYear();
                time = new Date(finalD + ' ' + H);
            }
            else {
                const split = timeAgo.split('-');
                time = new Date(split[1] + '/' + split[0] + '/' + split[2]);
            }
        }
        return time;
    }
    parseMangaDetails($, mangaId) {
        const tags = [];
        $('article#item-detail li.kind p.col-xs-8 a').each((_, obj) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const slug = href.split('/').filter(Boolean).pop() ?? label.toLowerCase();
            const id = `cate.${slug}`;
            tags.push(App.createTag({ label, id }));
        });
        const title = $('article#item-detail h1.title-detail, article#item-detail h1, h1.title-detail').first().text().trim();
        const image = $('article#item-detail div.col-image img').attr('src') ?? '';
        const desc = $('article#item-detail div.detail-content p').map((_, el) => $(el).text().trim()).get().join('\n');
        const status = $('article#item-detail li.status p.col-xs-8').text().trim();
        const author = $('article#item-detail li.author p.col-xs-8').text().trim();
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [title],
                author,
                image: image.startsWith('//') ? `https:${image}` : image,
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
            }),
        });
    }
    parseChapterList($) {
        const chapters = [];
        $('li.row:not(.heading)').each((_, obj) => {
            const chapterLink = $('div.chapter a, a', obj).first();
            const href = chapterLink.attr('href') ?? '';
            const name = chapterLink.text().trim();
            if (!href || !name)
                return;
            // Store path after domain as chapterId, strip leading slash
            const chapterId = href.replace(/^https?:\/\/[^/]+\/truyen-tranh\//, '');
            const chapNum = parseFloat(name.replace(/[^0-9.]/g, '') || '0') || 0;
            const dateText = $('div.col-xs-4', obj).text().trim();
            const time = this.convertTime(dateText);
            const views = $('div.col-xs-3', obj).text().trim();
            chapters.push(App.createChapter({
                id: chapterId,
                chapNum,
                name,
                langCode: '🇻🇳',
                time,
                group: `${views} lượt xem`,
            }));
        });
        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }
        return chapters;
    }
    parseChapterDetails($) {
        const pages = [];
        $('#view-chapter img, .chapter-content img, .reading-content img, .content-chapter img').each((_, obj) => {
            const attributes = ['src', 'data-src', 'data-cfsrc', 'data-original'];
            let link = '';
            for (const attr of attributes) {
                const url = $(obj).attr(attr);
                if (url && !url.includes('chapter_default')) {
                    link = url;
                    break;
                }
            }
            if (!link) {
                for (const attr of attributes) {
                    const url = $(obj).attr(attr);
                    if (url) {
                        link = url;
                        break;
                    }
                }
            }
            if (link) {
                const fullUrl = link.startsWith('//') ? `https:${link}`
                    : link.startsWith('http') ? link
                        : `https://${link}`;
                pages.push(fullUrl);
            }
        });
        if (!pages.length) {
            const hasLoginHint = $('a[href*="/Account/Login"], a[href*="/dang-nhap"], a[href*="returnUrl="], .login-page-wrapper').length > 0 ||
                $('title').text().toLowerCase().includes('đăng nhập') ||
                $('title').text().toLowerCase().includes('login');
            if (hasLoginHint) {
                throw new Error('Vui lòng đăng nhập bằng Webview để xem chương này');
            }
            throw new Error('Không tìm thấy hình ảnh');
        }
        return pages;
    }
    // Popular / search pages: div.item cards
    parseSearchResults($) {
        const tiles = [];
        $('div.item').each((_, obj) => {
            const titleEl = $('figcaption h3 a, a.jtip', obj).first();
            const title = titleEl.text().trim();
            const href = titleEl.attr('href') ?? '';
            if (!href || !title)
                return;
            const mangaId = href.replace(/^https?:\/\/[^/]+\/truyen-tranh\//, '');
            const image = $('div.image a img', obj).attr('src') ?? '';
            const subtitle = $('figcaption ul li:first-child a', obj).text().trim();
            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: image.startsWith('//') ? `https:${image}` : image,
                title,
                subtitle,
            }));
        });
        return tiles;
    }
    // Latest page: #ctl00_divCenter .row > .item cards
    parseLatestItems($) {
        const tiles = [];
        $('#ctl00_divCenter .row > .item').each((_, obj) => {
            const titleEl = $('figcaption h3 a, a.jtip', obj).first();
            const title = titleEl.text().trim();
            const href = titleEl.attr('href') ?? '';
            if (!href || !title)
                return;
            const mangaId = href.replace(/^https?:\/\/[^/]+\/truyen-tranh\//, '');
            const image = $('div.image a img', obj).attr('src') ?? '';
            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: image.startsWith('//') ? `https:${image}` : image,
                title,
            }));
        });
        return tiles;
    }
    parseViewMoreItems($, homepageSectionId) {
        switch (homepageSectionId) {
            case 'popular':
            case 'full':
                return this.parseSearchResults($);
            case 'latest':
                return this.parseLatestItems($);
            default:
                throw new Error(`Invalid homepageSectionId: ${homepageSectionId}`);
        }
    }
    parseTags($) {
        const genres = [];
        const statuses = [];
        const sorts = [];
        // Genre links: /tim-truyen/<slug>
        $('ul.categories-detail li:not(.active) > a, .categories-detail li:not(.active) > a').each((_, obj) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const slug = href.split('/').filter(Boolean).pop() ?? '';
            const id = `cate.${slug}`;
            if (slug && label)
                genres.push(App.createTag({ id, label }));
        });
        // Status: ?status=<val>
        $('#status-comic a').each((_, obj) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const val = href.split('=').pop() ?? '';
            const id = `status.${val}`;
            if (val && label)
                statuses.push(App.createTag({ id, label }));
        });
        // Sort: ?sort=<val>
        $('.list-select > a').each((_, obj) => {
            const label = $(obj).text().trim();
            const href = $(obj).attr('href') ?? '';
            const val = href.split('=').pop() ?? '';
            const id = `sort.${val}`;
            if (val && label)
                sorts.push(App.createTag({ id, label }));
        });
        // Static fallback for sorts/statuses in case selectors don't match
        if (!sorts.length) {
            [
                { label: 'Top all', id: 'sort.10' },
                { label: 'Top tháng', id: 'sort.11' },
                { label: 'Top tuần', id: 'sort.12' },
                { label: 'Top ngày', id: 'sort.13' },
                { label: 'Truyện mới', id: 'sort.15' },
                { label: 'Số chương', id: 'sort.30' },
            ].forEach(t => sorts.push(App.createTag(t)));
        }
        if (!statuses.length) {
            [
                { label: 'Tất cả', id: 'status.-1' },
                { label: 'Đang tiến hành', id: 'status.1' },
                { label: 'Đã hoàn thành', id: 'status.2' },
            ].forEach(t => statuses.push(App.createTag(t)));
        }
        return [
            App.createTagSection({ id: '1', label: 'Thể Loại (Chỉ chọn 1)', tags: genres }),
            App.createTagSection({ id: '2', label: 'Trạng Thái (Chỉ chọn 1)', tags: statuses }),
            App.createTagSection({ id: '3', label: 'Sắp Xếp (Chỉ chọn 1)', tags: sorts }),
        ];
    }
}
exports.Parser = Parser;

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettings = exports.domainSettings = exports.getDomain = void 0;
const DEFAULT_BASE_URL = 'https://luottruyen7.com';
const getDomain = async (stateManager) => {
    return await stateManager.retrieve('baseUrl') ?? DEFAULT_BASE_URL;
};
exports.getDomain = getDomain;
const domainSettings = (stateManager) => {
    return App.createDUINavigationButton({
        id: 'domain_settings',
        label: 'Ghi đè URL cơ sở',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    isHidden: false,
                    id: 'content',
                    rows: async () => [
                        App.createDUIInputField({
                            id: 'baseUrl',
                            label: 'URL cơ sở',
                            value: App.createDUIBinding({
                                get: async () => await (0, exports.getDomain)(stateManager),
                                set: async (value) => {
                                    const trimmed = value.trim().replace(/\/$/, '');
                                    await stateManager.store('baseUrl', trimmed || DEFAULT_BASE_URL);
                                },
                            }),
                        }),
                    ],
                }),
            ],
        }),
    });
};
exports.domainSettings = domainSettings;
function resetSettings(stateManager) {
    return App.createDUIButton({
        id: 'reset',
        label: 'Đặt lại mặc định',
        onTap: async () => {
            await stateManager.store('baseUrl', DEFAULT_BASE_URL);
        },
    });
}
exports.resetSettings = resetSettings;

},{}]},{},[62])(62)
});
