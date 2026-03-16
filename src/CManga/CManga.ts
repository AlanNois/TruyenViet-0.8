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

const DOMAIN = 'https://cmangax15.com/';

export const CMangaInfo: SourceInfo = {
    version: '1.1.2',
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
        requestTimeout: 50000,
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
        const json = JSON.parse(JSON.parse(await this.getAPI(`${DOMAIN}api/get_data_by_id?table=album&data=info&id=${mangaId}`))['data']['info']);
        return this.parser.parseMangaDetails(json, mangaId, DOMAIN);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const json = JSON.parse(await this.getAPI(`${DOMAIN}api/chapter_list?album=${mangaId}&page=1&limit=99999999&v=1v16`));
        return this.parser.parseChapters(json['data']);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const json = await this.getAPI(`${DOMAIN}api/chapter_image?chapter=${chapterId}&v=0`);
        const pages = this.parser.parseChapterDetails(JSON.parse(json)['data']);
        return App.createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        });
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;
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

        const url = /*query.title ?*/ encodeURI(`${DOMAIN}api/home_album_list?file=image&sort=update&string=${query.title}&type=all&limit=40&page=${page}`);
        // : (search.top !== '' ? `${DOMAIN}api/top?data=book_top`
        // : encodeURI(`${DOMAIN}api/list_item?page=${page}&limit=40&sort=${search.sort}&type=all&tag=${search.tag}&child=off&status=${search.status}&num_chapter=${search.num_chapter}`))

        // const request = App.createRequest({
        //     url: url,
        //     method: 'GET',
        // })
        // const response = await this.requestManager.schedule(request, 1);
        // const json = (query.title || search.top !== "") ? JSON.parse(response.data as string) : JSON.parse(JSON.parse(response.data as string));
        // const tiles = this.parser.parseSearch(json, search, DOMAIN);
        const json = JSON.parse(await this.getAPI(url));
        const tiles = this.parser.parseSectionAPI(json['data'], DOMAIN);
        const allPage = (json['total'] / 40);
        metadata = (page < allPage) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: tiles,
            metadata
        });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('CManga Running...');
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: 'TRUYỆN NỔI BẬT', containsMoreItems: false, type: HomeSectionType.featured, }),
            App.createHomeSection({ id: 'new_updated', title: 'TRUYỆN MỚI CẬP NHẬT', containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
            App.createHomeSection({ id: 'recommended', title: 'TRUYỆN ĐỀ CỬ', containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
            App.createHomeSection({ id: 'locked', title: 'TRUYỆN KHÓA', containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
            App.createHomeSection({ id: 'exclusive', title: 'TRUYỆN ĐỘC QUYỀN', containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
            App.createHomeSection({ id: 'top_fire', title: 'TRUYỆN CHÁY HÀNG', containsMoreItems: false, type: HomeSectionType.singleRowLarge, }),
            App.createHomeSection({ id: 'new_coin_top', title: 'TRUYỆN XU/MỚI TOP', containsMoreItems: false, type: HomeSectionType.singleRowLarge, }),
            App.createHomeSection({ id: 'completed', title: 'TRUYỆN HOÀN THÀNH', containsMoreItems: true, type: HomeSectionType.singleRowNormal, }),
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'featured':
                    url = `${DOMAIN}api/home_album_list?file=image&sort=update&tag=&type=hot&limit=30&page=1`
                    break;
                case 'new_updated':
                    url = `${DOMAIN}api/home_album_list?file=image&type=unique&sort=update&tag=&limit=21&page=1`
                    break;
                case 'recommended':
                    url = `${DOMAIN}api/home_album_list?file=image&type=hot&sort=update&tag=&limit=30&page=1`
                    break;
                case 'locked':
                    url = `${DOMAIN}api/home_album_list?file=image&type=new&sort=update&tag=&limit=21&page=1`
                    break;
                case 'exclusive':
                    url = `${DOMAIN}api/home_album_list?file=image&type=done&sort=update&tag=&limit=21&page=1`
                    break;
                case 'top_fire':
                    url = `${DOMAIN}api/home_album_top?file=image&type=fire&limit=10`
                    break;
                case 'new_coin_top':
                    url = `${DOMAIN}api/home_album_top?file=image&type=coin&limit=10`
                    break;
                case 'completed':
                    url = `${DOMAIN}api/home_album_list?file=image&type=complete&sort=update&tag=&limit=21&page=1`
                    break;
                default:
                    throw new Error('Invalid home section ID');
            }

            const json = JSON.parse(await this.getAPI(url));
            section.items = this.parser.parseSectionAPI(json['data'], DOMAIN);
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;
        let url = '';
        switch (homepageSectionId) {
            case 'new_updated':
                url = `${DOMAIN}api/home_album_list?file=image&type=unique&sort=update&tag=&limit=21&page=${page}`
                break;
            case 'recommended':
                url = `${DOMAIN}api/home_album_list?file=image&type=hot&sort=update&tag=&limit=30&page=${page}`
                break;
            case 'locked':
                url = `${DOMAIN}api/home_album_list?file=image&type=new&sort=update&tag=&limit=21&page=${page}`
                break;
            case 'exclusive':
                url = `${DOMAIN}api/home_album_list?file=image&type=done&sort=update&tag=&limit=21&page=${page}`
                break;
            case 'completed':
                url = `${DOMAIN}api/home_album_list?file=image&type=complete&sort=update&tag=&limit=21&page=${page}`
                break;
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist');
        }

        const json = JSON.parse(await this.getAPI(url));
        const manga = this.parser.parseSectionAPI(json['data'], DOMAIN);
        let allPage: number;
        switch (homepageSectionId) {
            case 'new_updated':
                allPage = (json['total'] / 21);
                break;
            case 'locked':
                allPage = (json['total'] / 21);
                break;
            case 'exclusive':
                allPage = (json['total'] / 21);
                break;
            case 'recommended':
                allPage = (json['total'] / 30);
                break;
            case 'completed':
                allPage = (json['total'] / 21);
                break;
        }
        metadata = (page < allPage) ? { page: page + 1 } : undefined;
        return App.createPagedResults({
            results: manga,
            metadata
        });
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
            const url = `${DOMAIN}api/list_item?page=${page}&limit=40&sort=new&type=all&tag=&child_protect=off&status=all&num_chapter=0`
            const json = JSON.parse(await this.getAPI(url));
            const updateManga = Object.keys(json).map(key => {
                const id = `${json[key].url}-${json[key].id_book}`;
                const [date, time] = json[key].last_update.split(' ');
                const [year, month, day] = date.split('-');
                const [hour, minute] = time.split(':');
                const formattedTime = `${hour}:${minute}`;
                const formattedDate = `${month}/${day}/${year}`;
                const timeFinal = new Date(`${formattedDate} ${formattedTime}`);

                return {
                    id,
                    time: timeFinal
                };
            });

            updatedManga.push(...updateManga);

        }

        const returnObject = this.parser.parseUpdatedManga(updatedManga, time, ids);
        mangaUpdatesFoundCallback(App.createMangaUpdates(returnObject));
    }
}