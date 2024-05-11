import {
    MangaUpdates,
    // TagSection,
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

const DOMAIN = 'https://cmangaog.com/';

export const CMangaInfo: SourceInfo = {
    version: '1.0.5',
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

    // constructor(private cheerio: CheerioAPI) { }

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

    // private async DOMTHML(url: string): Promise<CheerioStatic> {
    //     const request = App.createRequest({
    //         url: url,
    //         method: 'GET',
    //     });
    //     const response = await this.requestManager.schedule(request, 1);
    //     return this.cheerio.load(response.data as string);
    // }

    private async getAPI(url: string): Promise<string> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });
        const response = await this.requestManager.schedule(request, 1);
        return response.data as string;
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const json = JSON.parse(JSON.parse(await this.getAPI(`${DOMAIN}api/get_data_by_id?table=album&data=info&id=${mangaId}`))['info']);
        return this.parser.parseMangaDetails(json, mangaId, DOMAIN);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const json = JSON.parse(await this.getAPI(`${DOMAIN}api/chapter_list?album=${mangaId}&v=0`));
        return this.parser.parseChapters(json);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const json = await this.getAPI(`${DOMAIN}api/chapter_image?chapter=${chapterId}&v=0`);
        const pages = this.parser.parseChapterDetails(JSON.parse(json));
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;
        // const tags = query.includedTags?.map(tag => tag.id) ?? [];

        // const search = {
        //     status: "all",
        //     num_chapter: "0",
        //     sort: "new",
        //     tag: "",
        //     top: ""
        // };

        // tags.map((value) => {
        //     switch (value.split('.')[0]) {
        //         case 'sort':
        //             search.sort = String(value.split('.')[1]);
        //             break;
        //         case 'status':
        //             search.status = String(value.split('.')[1]);
        //             break;
        //         case 'num_chapter':
        //             search.num_chapter = String(value.split('.')[1]);
        //             break;
        //         case 'tag':
        //             search.tag = String(value.split('.')[1]);
        //             break;
        //         case 'top':
        //             search.top = String(value.split('.')[1]);
        //             break;
        //     }
        // });

        const url = /*query.title ?*/ encodeURI(`${DOMAIN}api/search?string=${query.title}`)
        // : (search.top !== '' ? `${DOMAIN}api/top?data=book_top`
        // : encodeURI(`${DOMAIN}api/list_item?page=${page}&limit=40&sort=${search.sort}&type=all&tag=${search.tag}&child=off&status=${search.status}&num_chapter=${search.num_chapter}`))

        // const request = App.createRequest({
        //     url: url,
        //     method: 'GET',
        // })
        // const response = await this.requestManager.schedule(request, 1);
        // const json = (query.title || search.top !== "") ? JSON.parse(response.data as string) : JSON.parse(JSON.parse(response.data as string));
        // const tiles = this.parser.parseSearch(json, search, DOMAIN);
        const json = JSON.parse(await this.getAPI(url))
        const tiles = this.parser.parseSearch(json, DOMAIN)
        const allPage = (json['total'] / 40)
        metadata = (page < allPage) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: tiles,
            metadata
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('CManga Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'new_updated', title: "TRUYỆN MỚI CẬP NHẬT", containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
            // App.createHomeSection({ id: 'new_added', title: "VIP TRUYỆN SIÊU HAY", containsMoreItems: true, type: HomeSectionType.singleRowNormal, })
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'new_updated':
                    url = `${DOMAIN}api/home_album_list?num_chapter=0&sort=update&tag=all&limit=20&page=1&user=0&child_protect=off`;
                    break;
                // case 'new_added':
                //     url = `${DOMAIN}api/list_item?page=1&limit=20&sort=new&type=all&tag=Truy%E1%BB%87n%20si%C3%AAu%20hay&child=off&status=all&num_chapter=0`;
                //     break;
                default:
                    throw new Error(`Invalid home section ID`);
            }

            const json = JSON.parse(await this.getAPI(url));
            switch (section.id) {
                case 'new_updated':
                    section.items = this.parser.parseNewUpdatedSection(json['data'], DOMAIN);
                    break;
                // case 'new_added':
                //     section.items = this.parser.parseNewAddedSection(json, DOMAIN);
                //     break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;
        let url = '';
        switch (homepageSectionId) {
            case 'new_updated':
                url = `${DOMAIN}api/home_album_list?num_chapter=0&sort=update&tag=all&limit=40&page=${page}&user=0&child_protect=off`
                break;
            // case 'new_added':
            //     url = `${DOMAIN}api/list_item?page=${page}&limit=40&sort=new&type=all&tag=Truy%E1%BB%87n%20si%C3%AAu%20hay&child=off&status=all&num_chapter=0`
            //     break;
            default:
                throw new Error(`Requested to getViewMoreItems for a section ID which doesn't exist`);
        }

        const json = JSON.parse(await this.getAPI(url));
        const manga = this.parser.parseViewMore(json['data'], DOMAIN);
        const allPage = (json['total'] / 40)
        metadata = (page < allPage) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        })
    }

    // async getSearchTags(): Promise<TagSection[]> {
    //     const url = DOMAIN
    //     const $ = await this.DOMTHML(url);
    //     return this.parser.parseTags($);
    // }

    async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {

        const updatedManga: any = [];
        const pages = 10;
        for (let page = 1; page <= pages; page++) {
            let url = `${DOMAIN}api/list_item?page=${page}&limit=40&sort=new&type=all&tag=&child_protect=off&status=all&num_chapter=0`
            const json = JSON.parse(await this.getAPI(url));
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