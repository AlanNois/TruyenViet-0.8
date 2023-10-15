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
    BadgeColor
} from '@paperback/types';

import { Parser } from './GocTruyenTranhParser';

const DOMAIN = 'https://goctruyentranhvui.com/';

export const GocTruyenTranhInfo: SourceInfo = {
    version: '1.0.1',
    name: 'GocTruyenTranh',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com.AlanNois/',
    description: 'Extension that pulls manga from GocTruyenTranh',
    websiteBaseURL: DOMAIN,
    contentRating: ContentRating.EVERYONE,
    sourceTags: [
        {
            text: "Recommended",
            type: BadgeColor.BLUE
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}

export class GocTruyenTranh implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

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
                        'user-agent': await this.requestManager.getDefaultUserAgent()
                    }
                }
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

    private async DOMHTML(url: string): Promise<CheerioStatic> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(response.data as string);
    }

    private async callAPI(url: string): Promise<any> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return JSON.parse(response.data as string);
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId.split('::')[0]}`);
        return this.parser.parseMangaDetails($, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const json = await this.callAPI(`${DOMAIN}api/comic/${mangaId.split('::')[1]}/chapter?offset=0&limit=-1`);
        return this.parser.parseChapterList(json);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId.split('::')[0]}/${chapterId}`);
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 0;

        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        const url = query.title ? encodeURI(`${DOMAIN}api/comic/search?name=${query.title}`) : `${DOMAIN}api/comic/search/category?p=${page}&value=${tags[0]}`;
        const json = await this.callAPI(url);
        const tiles = this.parser.parseSearchResults(json);

        metadata = query.title ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results: tiles,
            metadata
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('GocTruyenTranh Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'hot', title: 'TRUYỆN HOT NHẤT', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_added', title: 'TRUYỆN MỚI', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_updated', title: 'TRUYỆN CẬP NHẬT GẦN ĐÂY', containsMoreItems: true, type: HomeSectionType.singleRowNormal })
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'hot':
                    url = `${DOMAIN}api/comic/search/view?p=0`;
                    break;
                case 'new_added':
                    url = `${DOMAIN}api/comic/search/new?p=0`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}api/comic/search/recent?p=0`;
                    break;
                default:
                    throw new Error(`Invalid home section ID`);
            }


            let json = await this.callAPI(url);

            switch (section.id) {
                case 'hot':
                    section.items = this.parser.parseViewMoreItems(json).slice(0, 10);
                    break;
                case 'new_added':
                    section.items = this.parser.parseViewMoreItems(json).slice(0, 10);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseViewMoreItems(json).slice(0, 10);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 0;
        let url: string;
        switch (homepageSectionId) {
            case 'hot':
                url = `${DOMAIN}api/comic/search/view?p=${page}`;
                break;
            case 'new_added':
                url = `${DOMAIN}api/comic/search/new?p=${page}`;
                break;
            case 'new_updated':
                url = `${DOMAIN}api/comic/search/recent?p=${page}`;
                break;
            default:
                throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
        }

        const json = await this.callAPI(url);
        const tiles = this.parser.parseViewMoreItems(json);
        metadata = { page: page + 1 };
        return App.createPagedResults({
            results: tiles,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = `${DOMAIN}api/category`;
        const json = await this.callAPI(url);
        return this.parser.parseTags(json);
    }
}