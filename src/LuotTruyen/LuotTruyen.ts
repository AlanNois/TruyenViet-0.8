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
    DUISection,
} from '@paperback/types';

import type { CheerioAPI } from 'cheerio';
import { Parser } from './LuotTruyenParser';
import {
    getDomain,
    domainSettings,
    resetSettings,
} from './LuotTruyenSetting';

export const isLastPage = ($: CheerioAPI): boolean => {
    const lastPage = Number($('ul.pagination > li.page-item:not(:has(a[rel=\'next\'])) a').last().text().trim());
    const currentPage = Number($('ul.pagination > li.active').text().trim());
    return currentPage >= lastPage;
};

export const LuotTruyenInfo: SourceInfo = {
    version: '1.1.1',
    name: 'LuotTruyen',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from LuotTruyen',
    contentRating: ContentRating.MATURE,
    websiteBaseURL: 'https://luottruyen7.com',
    sourceTags: [
        {
            text: 'Vietnamese',
            type: BadgeColor.BLUE,
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.SETTINGS_UI | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED,
};

export class LuotTruyen implements ChapterProviding, MangaProviding, SearchResultsProviding, HomePageSectionsProviding {

    constructor(private cheerio: CheerioAPI) { }

    stateManager = App.createSourceStateManager();
    parser = new Parser();

    private async getBaseUrl(): Promise<string> {
        return getDomain(this.stateManager);
    }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 20000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${await this.getBaseUrl()}/`,
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

    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection({
            id: 'main',
            header: 'Source Settings',
            rows: async () => [
                domainSettings(this.stateManager),
                resetSettings(this.stateManager),
            ],
            isHidden: false,
        });
    }

    getMangaShareUrl(mangaId: string): string {
        return `${this.getBaseUrl()}/truyen-tranh/${mangaId}`;
    }

    private async DOMHTML(url: string): Promise<CheerioAPI> {
        const request = App.createRequest({ url, method: 'GET' });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
        return this.cheerio.load(response.data as string);
    }

    private async DOMPOST(path: string, body: Record<string, string>): Promise<CheerioAPI> {
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
        return this.cheerio.load(response.data as string);
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const baseUrl = await this.getBaseUrl();
        const $ = await this.DOMHTML(`${baseUrl}/truyen-tranh/${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        // storyId is the numeric suffix after the last hyphen, e.g. "slug-12345" → "12345"
        const storyId = mangaId.split('-').pop() ?? '';
        const $ = await this.DOMPOST('/Story/ListChapterByStoryID', { StoryID: storyId });
        return this.parser.parseChapterList($);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const baseUrl = await this.getBaseUrl();
        const $ = await this.DOMHTML(`${baseUrl}/truyen-tranh/${chapterId}`);
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({ id: chapterId, mangaId, pages });
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1;

        const search = {
            cate: '',
            status: '-1',
            sort: '10',
        };

        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        for (const value of tags) {
            const [key, val] = value.split('.');
            switch (key) {
                case 'cate': search.cate = String(val); break;
                case 'status': search.status = String(val); break;
                case 'sort': search.sort = String(val); break;
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
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({ results: tiles, metadata });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const baseUrl = await this.getBaseUrl();
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'popular', title: 'TRUYỆN PHỔ BIẾN', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'latest', title: 'MỚI CẬP NHẬT', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'full', title: 'TRUYỆN ĐÃ HOÀN THÀNH', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'popular': url = `${baseUrl}/tim-truyen?status=-1&sort=10`; break;
                case 'latest': url = `${baseUrl}/?page=1&typegroup=0`; break;
                case 'full': url = `${baseUrl}/tim-truyen?status=2&sort=10`; break;
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

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1;
        const baseUrl = await this.getBaseUrl();
        let url: string;

        switch (homepageSectionId) {
            case 'popular': url = `${baseUrl}/tim-truyen?status=-1&sort=10&page=${page}`; break;
            case 'latest': url = `${baseUrl}/?page=${page}&typegroup=0`; break;
            case 'full': url = `${baseUrl}/tim-truyen?status=2&sort=10&page=${page}`; break;
            default: throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist');
        }

        const $ = await this.DOMHTML(url);
        const manga = this.parser.parseViewMoreItems($, homepageSectionId);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({ results: manga, metadata });
    }

    async getSearchTags(): Promise<TagSection[]> {
        const baseUrl = await this.getBaseUrl();
        const $ = await this.DOMHTML(`${baseUrl}/tim-truyen`);
        return this.parser.parseTags($);
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to home page ${LuotTruyen.name} source and press the cloud icon.`);
        }
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
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