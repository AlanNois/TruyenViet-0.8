import {
    MangaUpdates,
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

import { Parser } from './CMangaParser';

const DOMAIN = 'https://cmangaah.com/';

export const CMangaInfo: SourceInfo = {
    version: '1.0.0',
    name: 'CManga',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from CManga',
    contentRating: ContentRating.ADULT,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Recommended',
            type: BadgeColor.BLUE
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
};

export class CManga implements ChapterProviding, MangaProviding, SearchResultsProviding, HomePageSectionsProviding {

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
                };
                return request;
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                return response;
            }
        }
    });

    getMangaShareUrl(mangaId: string): string {
        return `${DOMAIN}${mangaId}`;
    }

    parser = new Parser();

    private async DOMTHML(url: string): Promise<CheerioStatic> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(response.data as string);
    }

    private async getJSON(url: string): Promise<string> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return this.parser.decrypt_data(JSON.parse(response.data as string));
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMTHML(`${DOMAIN}${mangaId}`);
        const book_id = $.html().match(/book_id.+"(.+)"/)?.[1];
        const json = JSON.parse(await this.getJSON(`${DOMAIN}api/book_detail?opt1=${book_id}`))[0];
        return this.parser.parseMangaDetails(json, mangaId, DOMAIN);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.DOMTHML(`${DOMAIN}${mangaId}`);
        const book_id = $.html().match(/book_id.+"(.+)"/)?.[1];
        const json = JSON.parse(await this.getJSON(`${DOMAIN}api/book_chapter?opt1=${book_id}`));
        return this.parser.parseChapters(json, mangaId);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const chapID = chapterId.split('/').pop();
        const json = JSON.parse(JSON.parse(await this.getJSON(`${DOMAIN}api/chapter_content?opt1=${chapID}`))[0].content);
        const pages = this.parser.parseChapterDetails(json);
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;
        const tags = query.includedTags?.map(tag => tag.id) ?? [];

        const search = {
            status: "all",
            num_chapter: "0",
            sort: "new",
            tag: "",
            top: ""
        };

        tags.map((value) => {
            switch (value.split('.')[0]) {
                case 'sort':
                    search.sort = String(value.split('.')[1]);
                    break;
                case 'status':
                    search.status = String(value.split('.')[1]);
                    break;
                case 'num_chapter':
                    search.num_chapter = String(value.split('.')[1]);
                    break;
                case 'tag':
                    search.tag = String(value.split('.')[1]);
                    break;
                case 'top':
                    search.top = String(value.split('.')[1]);
                    break;
            }
        });

        const url = query.title ? encodeURI(`${DOMAIN}api/search?opt1=${query.title}`)
            : (search.top !== '' ? `${DOMAIN}api/top?data=book_top`
                : encodeURI(`${DOMAIN}api/list_item?page=${page}&limit=40&sort=${search.sort}&type=all&tag=${search.tag}&child=off&status=${search.status}&num_chapter=${search.num_chapter}`))

        const request = App.createRequest({
            url: url,
            method: 'GET',
        })
        const response = await this.requestManager.schedule(request, 1);
        const json = (query.title || search.top !== "") ? JSON.parse(response.data as string) : JSON.parse(this.parser.decrypt_data(JSON.parse(response.data as string)));
        const tiles = this.parser.parseSearch(json, search, DOMAIN);
        const allPage = (json['total'] / 40)
        metadata = (page < allPage) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: tiles,
            metadata
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'new_updated', title: "TRUYỆN MỚI CẬP NHẬT", containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
            App.createHomeSection({ id: 'new_added', title: "VIP TRUYỆN SIÊU HAY", containsMoreItems: true, type: HomeSectionType.singleRowNormal, })
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'new_updated':
                    url = `${DOMAIN}api/list_item?page=1&limit=20&sort=new&type=all&tag=&child=off&status=all&num_chapter=0`;
                    break;
                case 'new_added':
                    url = `${DOMAIN}api/list_item?page=1&limit=20&sort=new&type=all&tag=Truy%E1%BB%87n%20si%C3%AAu%20hay&child=off&status=all&num_chapter=0`;
                    break;
                default:
                    throw new Error(`Invalid home section ID`);
            }

            const json = JSON.parse(await this.getJSON(url));
            switch (section.id) {
                case 'new_updated':
                    section.items = this.parser.parseNewUpdatedSection(json, DOMAIN);
                    break;
                case 'new_added':
                    section.items = this.parser.parseNewAddedSection(json, DOMAIN);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;
        let url = '';
        switch (homepageSectionId) {
            case 'new_updated':
                url = `${DOMAIN}api/list_item?page=${page}&limit=40&sort=new&type=all&tag=&child=off&status=all&num_chapter=0`
                break;
            case 'new_added':
                url = `${DOMAIN}api/list_item?page=${page}&limit=40&sort=new&type=all&tag=Truy%E1%BB%87n%20si%C3%AAu%20hay&child=off&status=all&num_chapter=0`
                break;
            default:
                throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`);
        }

        const json = JSON.parse(await this.getJSON(url));
        const manga = this.parser.parseViewMore(json, DOMAIN);
        const allPage = (json['total'] / 40)
        metadata = (page < allPage) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = DOMAIN
        const $ = await this.DOMTHML(url);
        return this.parser.parseTags($);
    }

    async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {

        const updatedManga: any = [];
        const pages = 10;
        for (let page = 1; page <= pages; page++) {
            let url = `${DOMAIN}api/list_item?page=${page}&limit=40&sort=new&type=all&tag=&child=off&status=all&num_chapter=0`
            const json = JSON.parse(await this.getJSON(url));
            const updateManga = Object.keys(json).map(key => {
                const id = `${json[key].url}-${json[key].id_book}`;
                const [date, time] = json[key].last_update.split(' ');
                const [year, month, day] = date.split('-');
                const [hour, minute] = time.split(':');
                const formattedTime = `${hour}:${minute}`
                const formattedDate = `${month}/${day}/${year}`
                const timeFinal = new Date(`${formattedDate} ${formattedTime}`);

                return {
                    id,
                    time: timeFinal
                }
            });

            updatedManga.push(...updateManga);

        }

        const returnObject = this.parser.parseUpdatedManga(updatedManga, time, ids);
        mangaUpdatesFoundCallback(App.createMangaUpdates(returnObject));
    }
}