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
exports.CuuTruyen = exports.CuuTruyenInfo = void 0;
const types_1 = require("@paperback/types");
const CuuTruyenParser_1 = require("./CuuTruyenParser");
const CuuTruyenSetting_1 = require("./CuuTruyenSetting");
const CuuTruyenDrm_1 = require("./CuuTruyenDrm");
exports.CuuTruyenInfo = {
    version: '1.1.0',
    name: 'CuuTruyen',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from Cuutruyen',
    websiteBaseURL: 'https://cuutruyen.net',
    contentRating: types_1.ContentRating.MATURE,
    sourceTags: [
        {
            text: 'Recommended',
            type: types_1.BadgeColor.GREEN
        },
        {
            text: 'DRM protected',
            type: types_1.BadgeColor.YELLOW
        }
    ],
    intents: types_1.SourceIntents.MANGA_CHAPTERS | types_1.SourceIntents.HOMEPAGE_SECTIONS | types_1.SourceIntents.SETTINGS_UI
};
class CuuTruyen {
    constructor() {
        this.stateManager = App.createSourceStateManager();
        this.parser = new CuuTruyenParser_1.Parser();
        this.requestManager = App.createRequestManager({
            requestsPerSecond: 5,
            requestTimeout: 15000,
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
                    // Handle image DRM decryption
                    if (response.request.url.includes('drm_data=')) {
                        try {
                            const url = new URL(response.request.url);
                            const drmData = url.searchParams.get('drm_data') || url.hash.split('drm_data=')[1];
                            if (drmData && response.rawData) {
                                const decryptedData = await (0, CuuTruyenDrm_1.unscrambleImage)(new Uint8Array(response.rawData), drmData);
                                return {
                                    ...response,
                                    rawData: App.createRawData({ byteArray: decryptedData })
                                };
                            }
                        }
                        catch (error) {
                            console.error('DRM decryption failed:', error?.message || error);
                        }
                    }
                    return response;
                }
            }
        });
        this.domainPromise = (0, CuuTruyenSetting_1.getDomain)(this.stateManager);
    }
    async getBaseUrl() {
        const domain = await this.domainPromise;
        return `https://${domain}`;
    }
    async getApiUrl() {
        const domain = await this.domainPromise;
        return `https://${domain}/api/v2`;
    }
    async getSourceMenu() {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => {
                return [
                    (0, CuuTruyenSetting_1.resetSettings)(this.stateManager),
                    (0, CuuTruyenSetting_1.domainSetting)(this.stateManager)
                ];
            },
            isHidden: false
        });
    }
    getMangaShareUrl(mangaId) {
        return `${this.getBaseUrl()}/mangas/${mangaId}`;
    }
    async apiRequest(endpoint, params = '') {
        const url = `${await this.getApiUrl()}/${endpoint}${params ? `?${params}` : ''}`;
        const request = App.createRequest({
            url,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
            },
        });
        const response = await this.requestManager.schedule(request, 1);
        if (!response.data) {
            throw new Error('API response data is empty or undefined.');
        }
        return JSON.parse(response.data);
    }
    async getMangaDetails(mangaId) {
        const response = await this.apiRequest(`mangas/${mangaId}`);
        return this.parser.parseMangaDetails(response.data, mangaId);
    }
    async getChapters(mangaId) {
        const response = await this.apiRequest(`mangas/${mangaId}/chapters`);
        return this.parser.parseChaptersList(response.data);
    }
    async getChapterDetails(mangaId, chapterId) {
        const response = await this.apiRequest(`chapters/${chapterId}`);
        const pages = this.parser.parseChapterDetails(response.data);
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }
    async getSearchResults(query, metadata) {
        let page = metadata?.page ?? 1;
        const tag = query.includedTags[0]?.id;
        let endpoint;
        let params;
        if (query.title) {
            endpoint = 'mangas/search';
            params = `q=${encodeURIComponent(query.title)}&page=${page}&per_page=50`;
        }
        else if (tag) {
            endpoint = `tags/${tag}`;
            params = `page=${page}&per_page=50`;
        }
        else {
            // Default case if neither title nor tag is provided
            endpoint = 'mangas/search';
            params = `q=&page=${page}&per_page=50`;
        }
        const response = await this.apiRequest(endpoint, params);
        let mangas;
        if (!tag) {
            mangas = this.parser.parseSearchResults(response.data);
        }
        else {
            mangas = this.parser.parseSearchResults(response.data.mangas);
        }
        metadata += 1;
        return App.createPagedResults({
            results: mangas,
            metadata: Math.min(response._metadata.total_pages, metadata),
        });
    }
    async getHomePageSections(sectionCallback) {
        console.log("CuuTruyen Running...");
        const sections = [
            App.createHomeSection({ id: 'popular', title: "Phổ Biến Nhất", containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'latest', title: "Mới Cập Nhật", containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'completed', title: "Đã Hoàn Thành", containsMoreItems: true, type: types_1.HomeSectionType.singleRowNormal })
        ];
        for (const section of sections) {
            sectionCallback(section); // Send initial section with no items
            let response;
            switch (section.id) {
                case 'popular':
                    response = await this.apiRequest('mangas/top', 'duiration=all&page=1&per_page=25');
                    break;
                case 'latest':
                    response = await this.apiRequest('mangas/recently_updated', 'page=1&per_page=25');
                    break;
                case 'completed':
                    response = await this.apiRequest('tags/da-hoan-thanh', 'page=1&per_page=25');
                    break;
                default:
                    continue;
            }
            if (section.id === 'completed') {
                section.items = this.parser.parseSearchResults(response.data.mangas);
            }
            else {
                section.items = this.parser.parseSearchResults(response.data);
            }
            sectionCallback(section); // Send section with items
        }
    }
    async getViewMoreItems(homepageSectionId, metadata) {
        let page = metadata?.page ?? 1;
        let response;
        switch (homepageSectionId) {
            case 'popular':
                response = await this.apiRequest('mangas/top', `duiration=all&page=${page}&per_page=25`);
                break;
            case 'latest':
                response = await this.apiRequest('mangas/recently_updated', `page=${page}&per_page=25`);
                break;
            case 'completed':
                response = await this.apiRequest('tags/da-hoan-thanh', `page=${page}&per_page=25`);
                break;
            default:
                throw new Error('Invalid section ID');
        }
        let mangas;
        if (homepageSectionId === 'completed') {
            mangas = this.parser.parseSearchResults(response.data.mangas);
        }
        else {
            mangas = this.parser.parseSearchResults(response.data);
        }
        metadata += 1;
        return App.createPagedResults({
            results: mangas,
            metadata: Math.min(response._metadata.total_pages, metadata),
        });
    }
    async getSearchTags() {
        return this.parser.parseTags();
    }
}
exports.CuuTruyen = CuuTruyen;

},{"./CuuTruyenDrm":63,"./CuuTruyenParser":64,"./CuuTruyenSetting":65,"@paperback/types":61}],63:[function(require,module,exports){
"use strict";
/**
 * DRM Decryption module for CuuTruyen
 * Based on the Kotlin implementation from CuuTruyenImageInterceptor
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImageUrl = exports.extractDrmData = exports.hasDrmData = exports.unscrambleImage = void 0;
const DECRYPTION_KEY = "3141592653589793";
const DRM_DATA_KEY = "drm_data";
/**
 * Base64 decode utility for browser environment
 */
function base64Decode(base64String) {
    // Remove any whitespace and newlines
    const cleanBase64 = base64String.replace(/[\n\r\s]/g, '');
    // Use browser's atob if available, otherwise implement basic decode
    if (typeof atob !== 'undefined') {
        const binaryString = atob(cleanBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
    else {
        // Fallback base64 decoder
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const lookup = new Uint8Array(256);
        for (let i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }
        const len = cleanBase64.length;
        const bufferLength = (len * 3) / 4;
        const bytes = new Uint8Array(bufferLength);
        let p = 0;
        for (let i = 0; i < len; i += 4) {
            const encoded1 = lookup[cleanBase64.charCodeAt(i)] || 0;
            const encoded2 = lookup[cleanBase64.charCodeAt(i + 1)] || 0;
            const encoded3 = lookup[cleanBase64.charCodeAt(i + 2)] || 0;
            const encoded4 = lookup[cleanBase64.charCodeAt(i + 3)] || 0;
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return bytes;
    }
}
/**
 * XOR cipher decryption
 */
function decodeXorCipher(data, key) {
    const keyBytes = new TextEncoder().encode(key);
    const result = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        result[i] = data[i] ^ keyBytes[i % keyBytes.length];
    }
    return result;
}
/**
 * Main unscrambling function
 */
async function unscrambleImage(imageBytes, drmData) {
    try {
        // Decode the DRM data
        const drmBytes = base64Decode(drmData);
        const decryptedBytes = decodeXorCipher(drmBytes, DECRYPTION_KEY);
        const drmString = new TextDecoder().decode(decryptedBytes);
        // Validate DRM data format
        if (!drmString.startsWith('#v4|')) {
            throw new Error(`Invalid DRM data (does not start with expected magic bytes): ${drmString}`);
        }
        // Load the scrambled image into a PBImage
        const originalImage = App.createPBImage({ data: App.createRawData({ byteArray: imageBytes }) });
        // Create result canvas
        const resultCanvas = App.createPBCanvas();
        resultCanvas.setSize(originalImage.width, originalImage.height);
        // Parse scrambling instructions and unscramble
        const instructions = drmString.split('|').slice(1); // Skip the '#v4' part
        let sourceY = 0;
        for (const instruction of instructions) {
            if (!instruction.trim())
                continue;
            const [destY, height] = instruction.split('-').map(s => parseInt(s.trim(), 10));
            if (isNaN(destY) || isNaN(height)) {
                console.warn(`Invalid instruction: ${instruction}`);
                continue;
            }
            // Draw the section from source position to destination position
            resultCanvas.drawImage(originalImage, 0, sourceY, originalImage.width, height, // source rect
            0, destY // dest rect
            );
            sourceY += height;
        }
        // Convert result to bytes
        const encodedData = resultCanvas.encode('image/jpeg');
        if (!encodedData) {
            throw new Error('Failed to encode canvas to JPEG');
        }
        return encodedData; // Cast to Uint8Array as RawData is array-like
    }
    catch (error) {
        console.error('DRM unscrambling failed:', error);
        throw error;
    }
}
exports.unscrambleImage = unscrambleImage;
/**
 * Check if URL contains DRM data
 */
function hasDrmData(url) {
    return url.includes(`${DRM_DATA_KEY}=`) || url.includes(`#${DRM_DATA_KEY}=`);
}
exports.hasDrmData = hasDrmData;
/**
 * Extract DRM data from URL
 */
function extractDrmData(url) {
    try {
        // Try URL fragment first
        const fragmentMatch = url.match(`#${DRM_DATA_KEY}=([^&]*)`);
        if (fragmentMatch) {
            return decodeURIComponent(fragmentMatch[1]);
        }
        // Try query parameter
        const queryMatch = url.match(`[?&]${DRM_DATA_KEY}=([^&]*)`);
        if (queryMatch) {
            return decodeURIComponent(queryMatch[1]);
        }
        return null;
    }
    catch (error) {
        console.error('Failed to extract DRM data from URL:', error);
        return null;
    }
}
exports.extractDrmData = extractDrmData;
/**
 * Process image URL with DRM data
 */
async function processImageUrl(url, imageBytes) {
    const drmData = extractDrmData(url);
    if (!drmData) {
        // No DRM data, return original bytes
        return imageBytes;
    }
    // Unscramble the image
    return await unscrambleImage(imageBytes, drmData);
}
exports.processImageUrl = processImageUrl;

},{}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
class Parser {
    parseMangaDetails(data, mangaId) {
        const tags = [];
        if (data.tags) {
            for (const tag of data.tags) {
                tags.push(App.createTag({
                    label: tag.name ?? '',
                    id: tag.slug ?? ''
                }));
            }
        }
        const titles = [data.name ?? ''];
        const author = data.author?.name ?? data.author_name ?? '';
        const image = data.cover_url ?? data.cover_mobile_url ?? '';
        const banner = data.panorama_url ?? '';
        let desc = data.description ?? '';
        if (data.team?.name) {
            desc = `Nhóm dịch: ${data.team.name}\n\n${desc}`;
        }
        // Determine status from tags
        let status = 'Không rõ'; // Unknown
        if (data.tags) {
            const tagNames = data.tags.map((t) => t.name.toLowerCase());
            if (tagNames.includes('đang tiến hành')) {
                status = 'Đang tiến hành'; // Ongoing
            }
            else if (tagNames.includes('đã hoàn thành')) {
                status = 'Đã hoàn thành'; // Completed
            }
            else if (tagNames.includes('tạm ngưng')) {
                status = 'Tạm ngưng'; // On Hiatus
            }
        }
        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                author,
                image,
                banner: banner,
                desc: desc,
                status: status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
                additionalInfo: {
                    "Updated": data.updated_at ?? 'Không rõ',
                }
            }),
        });
    }
    parseChaptersList(data) {
        const chapters = [];
        for (const obj of data) {
            const chapNum = parseFloat(obj.number);
            const name = obj.name ?? '';
            const time = obj.updated_at ?? '';
            chapters.push(App.createChapter({
                id: obj.id.toString(),
                chapNum: isNaN(chapNum) ? 0 : chapNum,
                name,
                langCode: '🇻🇳',
                time,
                group: `${obj.views_count ?? 0} lượt xem`,
                sortingIndex: obj.order,
            }));
        }
        return chapters;
    }
    parseChapterDetails(data) {
        const pages = [];
        if (data.pages) {
            for (const page of data.pages) {
                const drmData = page.drm_data.replace(/\n/g, '');
                const imageUrl = `${page.image_url}${drmData ? `#drm_data=${drmData}` : ''}`;
                pages.push(imageUrl);
            }
        }
        return pages;
    }
    parseSearchResults(data) {
        const results = [];
        for (const manga of data) {
            if (!manga.id || !manga.name)
                continue;
            const title = manga.name.trim();
            const image = manga.cover_url ?? manga.cover_mobile_url ?? '';
            const subtitle = `Chương ${manga.newest_chapter_number}`;
            const mangaId = manga.id.toString();
            results.push(App.createPartialSourceManga({
                mangaId,
                image: encodeURI(image),
                title: title,
                subtitle: subtitle,
            }));
        }
        return results;
    }
    parseTags() {
        // Static tag list based on the Kotlin implementation
        const tags = [
            { label: 'Tất cả', id: '' },
            { label: 'Manga', id: 'manga' },
            { label: 'Đang tiến hành', id: 'dang-tien-hanh' },
            { label: 'Thể thao', id: 'the-thao' },
            { label: 'Hài hước', id: 'hai-huoc' },
            { label: 'Shounen', id: 'shounen' },
            { label: 'Học đường', id: 'hoc-duong' },
            { label: 'Chất lượng cao', id: 'chat-luong-cao' },
            { label: 'Comedy', id: 'comedy' },
            { label: 'Action', id: 'action' },
            { label: 'Horror', id: 'horror' },
            { label: 'Sci-fi', id: 'sci-fi' },
            { label: 'Martial arts', id: 'martial-arts' },
            { label: 'Supernatural', id: 'supernatural' },
            { label: 'Web comic', id: 'web-comic' },
            { label: 'Phiêu lưu', id: 'phieu-luu' },
            { label: 'Hậu tận thế', id: 'hau-tan-the' },
            { label: 'Hành động', id: 'hanh-dong' },
            { label: 'Đã hoàn thành', id: 'da-hoan-thanh' },
            { label: 'Sinh tồn', id: 'sinh-ton' },
            { label: 'Du hành thời gian', id: 'du-hanh-thoi-gian' },
            { label: 'Bí ẩn', id: 'bi-an' },
            { label: 'Trinh thám', id: 'trinh-tham' },
            { label: 'Kinh dị', id: 'kinh-di' },
            { label: 'Manhwa', id: 'manhwa' },
            { label: 'Webtoon', id: 'webtoon' },
            { label: 'Fantasy', id: 'fantasy' },
            { label: 'Võ thuật', id: 'vo-thuat' },
            { label: 'Drama', id: 'drama' },
            { label: 'Hệ thống', id: 'he-thong' },
            { label: 'Lãng mạn', id: 'lang-man' },
            { label: 'Đời thường', id: 'doi-thuong' },
            { label: 'Công sở', id: 'cong-so' },
            { label: 'Sát thủ', id: 'sat-thu' },
            { label: 'Phép thuật', id: 'phep-thuat' },
            { label: 'Tội phạm', id: 'toi-pham' },
            { label: 'Seinen', id: 'seinen' },
            { label: 'Isekai', id: 'isekai' },
            { label: 'Chuyển sinh', id: 'chuyen-sinh' },
            { label: 'Harem', id: 'harem' },
            { label: 'Mecha', id: 'mecha' },
            { label: 'Trung cổ', id: 'trung-co' },
            { label: 'LGBT', id: 'lgbt' },
            { label: 'Yaoi', id: 'yaoi' },
            { label: 'Game', id: 'game' },
            { label: 'Bi kịch', id: 'bi-kich' },
            { label: 'Động vật', id: 'dong-vat' },
            { label: 'Tâm lý', id: 'tam-ly' },
            { label: 'Manhua', id: 'manhua' },
            { label: 'Romance', id: 'romance' },
            { label: 'Shoujo', id: 'shoujo' },
            { label: 'Lịch sử', id: 'lich-su' },
            { label: 'Josei', id: 'josei' },
            { label: 'Yuri', id: 'yuri' },
            { label: 'Ecchi', id: 'ecchi' },
            { label: 'Smut', id: 'smut' },
            { label: 'School life', id: 'school-life' },
            { label: 'Slice of life', id: 'slice-of-life' },
            { label: 'Tragedy', id: 'tragedy' },
            { label: 'Mystery', id: 'mystery' },
            { label: 'Historical', id: 'historical' },
            { label: 'Medical', id: 'medical' },
            { label: 'Thriller', id: 'thriller' },
            { label: 'Survival', id: 'survival' },
            { label: 'Samurai', id: 'samurai' },
            { label: 'Virtual reality', id: 'virtual-reality' },
            { label: 'Video games', id: 'video-games' },
        ];
        return [
            App.createTagSection({
                id: '0',
                label: 'Thể Loại',
                tags: tags.map(x => App.createTag(x))
            })
        ];
    }
}
exports.Parser = Parser;

},{}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetSettings = exports.domainSetting = exports.getDomain = exports.Domains = void 0;
// const DOMAINS = ['cuutruyen.net', 'nettrom.com', 'hetcuutruyen.net', 'cuutruyent9sv7.xyz'];
var Domains;
(function (Domains) {
    Domains["CUUTRUYEN"] = "cuutruyen.net";
    Domains["NETTROM"] = "nettrom.com";
    Domains["HETCUUTRUYEN"] = "hetcuutruyen.net";
    Domains["CUUTRUYENT9SV7"] = "cuutruyent9sv7.xyz";
})(Domains = exports.Domains || (exports.Domains = {}));
const getDomain = async (stateManager) => {
    return await stateManager.retrieve('domain') ?? Domains.CUUTRUYEN;
};
exports.getDomain = getDomain;
const domainSetting = (stateManager) => {
    return App.createDUINavigationButton({
        id: 'domain',
        label: 'Domain',
        form: App.createDUIForm({
            sections: async () => [
                App.createDUISection({
                    isHidden: false,
                    id: 'domain_section',
                    rows: async () => {
                        await Promise.all([
                            (0, exports.getDomain)(stateManager)
                        ]);
                        return await [
                            App.createDUISelect({
                                id: 'domain_row',
                                label: 'Domain',
                                options: [Domains.CUUTRUYEN, Domains.NETTROM, Domains.HETCUUTRUYEN, Domains.CUUTRUYENT9SV7],
                                labelResolver: async (option) => {
                                    switch (option) {
                                        case Domains.CUUTRUYEN: return 'cuutruyen.net';
                                        case Domains.NETTROM: return 'nettrom.com';
                                        case Domains.HETCUUTRUYEN: return 'hetcuutruyen.net';
                                        case Domains.CUUTRUYENT9SV7: return 'cuutruyent9sv7.xyz';
                                        default: return '';
                                    }
                                },
                                value: App.createDUIBinding({
                                    get: async () => (0, exports.getDomain)(stateManager),
                                    set: async (value) => { await stateManager.store('domain_row', value); }
                                }),
                                allowsMultiselect: false
                            })
                        ];
                    }
                })
            ]
        })
    });
};
exports.domainSetting = domainSetting;
function resetSettings(stateManager) {
    return App.createDUIButton({
        id: 'reset',
        label: 'Reset to Default',
        onTap: async () => {
            await stateManager.store('domain_row', [Domains.CUUTRUYEN]);
        }
    });
}
exports.resetSettings = resetSettings;

},{}]},{},[62])(62)
});
