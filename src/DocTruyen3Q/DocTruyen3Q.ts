import {
    // MangaUpdates,
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

import { Parser } from './DocTruyen3QParser';

const DOMAIN = 'https://doctruyen3qtv.net/';

export const isLastPage = ($: CheerioStatic): boolean => {
    const lastPage = Number($("ul.pagination > li.page-item:not(:has(a[rel='next'])) a").last().text().trim());
    const currentPage = Number($("ul.pagination > li.active").text().trim());

    return currentPage >= lastPage;
}

export const DocTruyen3QInfo: SourceInfo = {
    version: '1.0.0',
    name: 'DocTruyen3Q',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from DocTruyen3Q',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: "Recommended",
            type: BadgeColor.BLUE
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
};

export class DocTruyen3Q implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding{


    constructor(private cheerio: CheerioAPI) { }

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
        return `${DOMAIN}truyen-tranh/${mangaId}`;
    }

    parser = new Parser();

    private async DOMHTML(url: string): Promise<CheerioStatic> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const resquest = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(resquest.data as string);
    }

    async  getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen-tranh/${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen-tranh/${mangaId}`);
        return this.parser.parseChapterList($);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen-tranh/${chapterId}`);
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({
            id : chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;

        const search = {
            cate: '',
            status: "2",
            sort: "1",
        }
        
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

        const url = `${DOMAIN}/tim-truyen/`
        const search_query = (!query.title) ? '?' : `?keyword=${query.title}&`;
        const param = `${search.cate}${search_query}sort=${search.sort}&status=${search.status}&page=${page}`
        const $ = await this.DOMHTML(`${url}${encodeURI(param)}`);
        const tiles = this.parser.parseSearchResults($);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results: tiles,
            metadata
        });
    };

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: "TRUYỆN ĐỀ CỬ", containsMoreItems: false, type: HomeSectionType.featured,}),
            App.createHomeSection({ id: 'viewest', title: "TRUYỆN XEM NHIỀU NHẤT", containsMoreItems: true, type: HomeSectionType.singleRowNormal,}),
            App.createHomeSection({ id: 'hot', title: "TRUYỆN HOT NHẤT", containsMoreItems: true, type: HomeSectionType.singleRowNormal,}),
            App.createHomeSection({ id: 'new_updated', title: "TRUYỆN MỚI CẬP NHẬT", containsMoreItems: true, type: HomeSectionType.singleRowNormal,}),
            App.createHomeSection({ id: 'full', title: "TRUYỆN ĐÃ HOÀN THÀNH", containsMoreItems: true, type: HomeSectionType.singleRowNormal,})
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'featured':
                    url = `${DOMAIN}`;
                    break;
                case 'viewest':
                    url = `${DOMAIN}tim-truyen?sort=2`;
                    break;
                case 'hot':
                    url = `${DOMAIN}hot`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}`;
                    break;
                case 'full':
                    url = `${DOMAIN}tim-truyen?status=1&sort=2`;
                    break;
                default:
                    throw new Error(`Invalid home section ID`);
            }

            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'featured':
                    section.items = this.parser.parseFeaturedSection($);
                    break;
                case 'viewest':
                    section.items = this.parser.parseSearchResults($);
                    break;
                case 'hot':
                    section.items = this.parser.parseHomeTemplate($, '#hot');
                    break;
                case 'new_updated':
                    section.items = this.parser.parseHomeTemplate($, '#home');
                    break;
                case 'full':
                    section.items = this.parser.parseSearchResults($);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;
        let url: string;
        let param: string;

        switch (homepageSectionId) {
            case 'viewest':
                url = `${DOMAIN}tim-truyen`;
                param = `?sort=2&page=${page}`;
                break;
            case 'hot':
                url = `${DOMAIN}hot`;
                param = `?page=${page}`;
                break;
            case 'new_updated':
                url = `${DOMAIN}`;
                param = `?page=${page}`;
                break;
            case 'full':
                url = `${DOMAIN}tim-truyen`;
                param = `?status=1&sort=2&page=${page}`;
                break;
            default:
                throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
        }

        const $ = await this.DOMHTML(`${url}${encodeURI(param)}`);
        let manga = this.parser.parseViewMoreItems($, homepageSectionId);
        metadata = isLastPage($) ? undefined : { page: page + 1 };
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = `${DOMAIN}tim-truyen`;
        const $ = await this.DOMHTML(url);
        return this.parser.parseTags($);
    }
}