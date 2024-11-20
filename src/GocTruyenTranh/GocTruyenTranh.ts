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

const DOMAIN = 'https://goctruyentranhvui6.com/';
const Auth = 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJWxINuIEhvw6BuZyDEkGluaCIsImNvbWljSWRzIjpbXSwicm9sZUlkIjpudWxsLCJncm91cElkIjpudWxsLCJhZG1pbiI6ZmFsc2UsInJhbmsiOjAsInBlcm1pc3Npb24iOltdLCJpZCI6IjAwMDA1MjYzNzAiLCJ0ZWFtIjpmYWxzZSwiaWF0IjoxNzE1NDI0NDU3LCJlbWFpbCI6Im51bGwifQ.EjYw-HvoWM6RhbNzJkp06sSh61leaPcND0gb94PlDKeTYxfxU-f6WaxINAVjVYOP0pcVcG3YmfBVb4FVEBqPxQ'

export const GocTruyenTranhInfo: SourceInfo = {
    version: '1.1.11',
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
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
}

export class GocTruyenTranh implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

    constructor(private cheerio: CheerioAPI) { }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 50000,
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
        this.CloudFlareError(response.status)
        return this.cheerio.load(response.data as string);
    }

    private async callAPI(url: string): Promise<any> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status)
        return JSON.parse(response.data as string);
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}truyen/${mangaId.split('::')[0]}`);
        return this.parser.parseMangaDetails($, mangaId, DOMAIN);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const json = await this.callAPI(`${DOMAIN}api/comic/${mangaId.split('::')[1]}/chapter?offset=0&limit=-1`);
        return this.parser.parseChapterList(json);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        // Extract manga ID and chapter number using destructuring
        const [mangaNumber, chapterNumber] = [mangaId.split('::')[1], chapterId.split('-')[1]];

        // Combine manga ID and chapter number into a single query parameter
        const comicId = `${mangaNumber}&chapterNumber=${chapterNumber}`;
        let pages: string[];

        const request = App.createRequest({
            url: `${DOMAIN}api/chapter/limitation`,
            method: 'POST',
            headers: {
                'authorization': Auth,
                'content-type': 'application/x-www-form-urlencoded',
                'x-requested-with': 'XMLHttpRequest'
            },
            data: { comicId }
        })
        const response = await this.requestManager.schedule(request, 1)
        const json = JSON.parse(response.data as string)

        pages = this.parser.parseChapterDetails(json, null, DOMAIN)

        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        });
    }


    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 0;

        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        const url = query.title ? encodeURI(`${DOMAIN}api/comic/search?name=${query.title}`) : `${DOMAIN}api/comic/search/category?p=${page}&value=${tags[0]}`;
        const json = await this.callAPI(url);
        const tiles = this.parser.parseSearchResults(json, DOMAIN);

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
                    section.items = this.parser.parseViewMoreItems(json, DOMAIN).slice(0, 10);
                    break;
                case 'new_added':
                    section.items = this.parser.parseViewMoreItems(json, DOMAIN).slice(0, 10);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseViewMoreItems(json, DOMAIN).slice(0, 10);
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
        const tiles = this.parser.parseViewMoreItems(json, DOMAIN);
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

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to home page ${GocTruyenTranh.name} source and press the cloud icon.`)
        }
    }

    async getCloudflareBypassRequestAsync() {
        return App.createRequest({
            url: DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${DOMAIN}/`,
                'origin': `${DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        })
    }

}