import {
    TagSection,
    SourceManga,
    Chapter,
    ChapterDetails,
    HomeSection,
    HomeSectionType,
    SearchRequest,
    PagedResults,
    Request,
    Response,
    ChapterProviding,
    MangaProviding,
    SearchResultsProviding,
    HomePageSectionsProviding,
    SourceInfo,
    ContentRating,
    SourceIntents,
    BadgeColor,
} from '@paperback/types';

import { Parser } from './ManhuaRockParser';

const DOMAIN = 'https://manhuarockz.com/'

export const isLastPage = ($: CheerioStatic): boolean => {
    const pages: number[] = [];

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

export const ManhuaRockInfo: SourceInfo = {
    version: '1.0.3',
    name: 'ManhuaRock',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois/',
    description: 'Extension that pulls manga from ManhuaRock.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Recommended',
            type: BadgeColor.BLUE
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
};

export class ManhuaRock implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

    /**
     * The constructor function takes a CheerioAPI object as a parameter and assigns it to a private
     * property.
     * @param {CheerioAPI} cheerio - The `cheerio` parameter is of type `CheerioAPI`. Cheerio is a
     * fast, flexible, and lean implementation of core jQuery designed specifically for the server. It
     * allows you to traverse and manipulate HTML and XML documents using a familiar API inspired by
     * jQuery.
     */
    constructor(private cheerio: CheerioAPI) { }

    /* The `readonly requestManager` property is creating an instance of the `RequestManager` class
    from the `App` module. */
    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': DOMAIN,
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                    }
                };
                return request;
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response;
            }
        }
    });

    getMangaShareUrl(mangaId: string): string {
        return `${DOMAIN}truyen/${mangaId}`;
    }

    parser = new Parser();

    /**
     * The function `DOMHTML` is a private asynchronous function that takes a URL as a parameter and
     * returns a Promise that resolves to a CheerioStatic object.
     * @param {string} url - The URL of the HTML page you want to load and parse.
     * @returns a Promise that resolves to a CheerioStatic object.
     */
    private async DOMHTML(url: string): Promise<CheerioStatic> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(response.data as string);
    }

    /**
     * The function `getAPI` is a private asynchronous function that makes a GET request to a specified
     * URL and returns the response data as a string.
     * @param {string} url - The `url` parameter is a string that represents the URL of the API
     * endpoint that you want to make a GET request to.
     * @returns a Promise that resolves to a string.
     */
    private async getAPI(url: string): Promise<string> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return response.data as string;
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId}`);
        return this.parser.parseChapterList($);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const json = await this.getAPI(`${DOMAIN}ajax/image/list/chap/${chapterId.split('/').pop()}?mode=vertical&quality=high`);
        const $ = this.cheerio.load(JSON.parse(json).html as string)
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;

        const search = {
            genre: '',
            sort: ''
        }

        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        for (const value of tags) {
            if (value.indexOf('.') === -1) {
                search.genre = value
            } else {
                const [_, val] = value.split(".");
                search.sort = String(val);
            }
        }

        const url = `${DOMAIN}${query.title ? 'tim-kiem/' : 'the-loai/'}`
        const param_1 = encodeURI(`${page}/?keyword=${query.title ?? ''}`)
        const param_2 = encodeURI(`${search.genre}/${page}/${search.sort ? '?sort=' : ''}${search.sort}`)
        const $ = await this.DOMHTML(`${url}${query.title ? param_1 : param_2}`)
        const tiles = this.parser.parseSearchResults($);
        metadata = !isLastPage($) ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: tiles,
            metadata
        });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('ManhuaRock Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: "Truyện Đề Cử", containsMoreItems: false, type: HomeSectionType.featured }),
            App.createHomeSection({ id: 'viewest', title: "Truyện Xem Nhiều Nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_updated', title: "Truyện Mới Cập Nhật", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'full', title: "Truyện Đã Hoàn Thành", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
        ];

        for (const section of sections) {
            sectionCallback(section)
            let url: string;
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
                    section.items = this.parser.parseSearchResults($)
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;
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
        let manga = []
        switch (homepageSectionId) {
            case 'featured':
                manga = this.parser.parseFeaturedSection($);
                break;
            default:
                manga = this.parser.parseSearchResults($)
        }
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results: manga,
            metadata
        });
    }

    async getSearchTags(): Promise<TagSection[]> {
        // const url = `${DOMAIN}`;
        // const $ = await this.DOMHTML(url);
        return this.parser.parseTags();
    }
}