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

import { Parser } from './NhatTruyenParser';

const DOMAIN = 'https://nhattruyenplus.com/';

export const isLastPage = ($: CheerioStatic): boolean => {
    const current = $('ul.pagination > li.active > a').text();
    let total = $('ul.pagination > li.PagerSSCCells:last-child').text();

    if (current) {
        total = total ?? '';
        return (+total) === (+current); //+ => convert value to number
    }
    return true;
}

export const NhatTruyenInfo: SourceInfo = {
    version: '1.0.0',
    name: 'NhatTruyen',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois/',
    description: 'Extension that pulls manga from NhatTruyen.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Recommended',
            type: BadgeColor.BLUE
        },
        {
            text: 'Notifications',
            type: BadgeColor.GREEN
        },
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
};

export class NhatTruyen implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding{
    
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
        return `${DOMAIN}/${mangaId}`;
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

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
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
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
        })
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true;
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;

        const search = {
            genres: '',
            exgenres: '',
            gender: "-1",
            status: "-1",
            minchapter: "1",
            sort: "0"
        };

        const extags = query.excludedTags?.map(tag => tag.id) ?? [];
        const exgenres: string[] = [];
        for (const value of extags) {
            if (value.indexOf('.') === -1) {
                exgenres.push(value);
            }
        }

        const tags = query.includedTags?.map(tag => tag.id) ?? [];
        const genres: string[] = [];
        for (const value of tags) {
            if (value.indexOf('.') === -1) {
                genres.push(value);
            } else {
                const [key, val] = value.split(".");
                switch (key) {
                    case 'minchapter':
                        search.minchapter = String(val);
                        break;
                    case 'gender':
                        search.gender = String(val);
                        break;
                    case 'sort':
                        search.sort = String(val);
                        break;
                    case 'status':
                        search.status = String(val);
                        break;
                }
            }
        }
        search.genres = genres.join(",");
        search.exgenres = exgenres.join(",");
        const paramExgenres = search.exgenres ? `&notgenres=${search.exgenres}` : '';

        const url = `${DOMAIN}${query.title ? '/tim-truyen' : '/tim-truyen-nang-cao'}`;
        const param = encodeURI(`?keyword=${query.title ?? ''}&genres=${search.genres}${paramExgenres}&gender=${search.gender}&status=${search.status}&minchapter=${search.minchapter}&sort=${search.sort}&page=${page}`);
        const $ = await this.DOMHTML(url + param);
        const tiles = this.parser.parseSearchResults($);
        metadata = !isLastPage($) ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: tiles,
            metadata
        });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('NhatTruyen Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: "Truyện Đề Cử", containsMoreItems: false, type: HomeSectionType.featured }),
            App.createHomeSection({ id: 'viewest', title: "Truyện Xem Nhiều Nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'hot', title: "Truyện Hot Nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_updated', title: "Truyện Mới Cập Nhật", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_added', title: "Truyện Mới Thêm Gần Đây", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'full', title: "Truyện Đã Hoàn Thành", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'featured':
                    url = `${DOMAIN}`;
                    break;
                case 'viewest':
                    url = `${DOMAIN}tim-truyen?status=-1&sort=10`;
                    break;
                case 'hot':
                    url = `${DOMAIN}hot`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}`;
                    break;
                case 'new_added':
                    url = `${DOMAIN}tim-truyen?status=-1&sort=15`;
                    break;
                case 'full':
                    url = `${DOMAIN}truyen-full`;
                    break;
                default:
                    throw new Error("Invalid homepage section ID");
            }

            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'featured':
                    section.items = this.parser.parseFeaturedSection($);
                    break;
                case 'viewest':
                    section.items = this.parser.parsePopularSection($);
                    break;
                case 'hot':
                    section.items = this.parser.parseHotSection($);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseNewUpdatedSection($);
                    break;
                case 'new_added':
                    section.items = this.parser.parseNewAddedSection($);
                    break;
                case 'full':
                    section.items = this.parser.parseFullSection($);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;
        let param = "";
        let url = "";

        switch (homepageSectionId) {
            case "viewest":
                param = `?status=-1&sort=10&page=${page}`;
                url = `${DOMAIN}tim-truyen`;
                break;
            case "hot":
                param = `?page=${page}`;
                url = `${DOMAIN}hot`;
                break;
            case "new_updated":
                param = `?page=${page}`;
                url = DOMAIN;
                break;
            case "new_added":
                param = `?status=-1&sort=15&page=${page}`;
                url = `${DOMAIN}tim-truyen`;
                break;
            case "full":
                param = `?page=${page}`;
                url = `${DOMAIN}truyen-full`;
                break;
            default:
                throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
        }

        const request = App.createRequest({
            url,
            method: 'GET',
            param,
        });

        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data as string);

        const manga = this.parser.parseViewMoreItems($);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results: manga,
            metadata
        });
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = `${DOMAIN}tim-truyen-nang-cao`;
        const $ = await this.DOMHTML(url);
        return this.parser.parseTags($);
    }

    async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        const updateManga: any = [];
        const pages = 10;
        for (let i = 1; i < pages + 1; i++) {
            // const request = createRequestObject({
            //     url: DOMAIN + '?page=' + i,
            //     method: 'GET',
            // })
            // const response = await this.requestManager.schedule(request, 1)
            // const $ = this.cheerio.load(response.data);
            let url = `${DOMAIN}?page=${i}`
            const $ = await this.DOMHTML(url);
            const updateManga = $('div.item', 'div.row').toArray().map(manga => {
                const id = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
                const time = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > i", manga).last().text().trim();
                return {
                    id: id,
                    time: time
                };
            });

            updateManga.push(...updateManga);

        }

        const returnObject = this.parser.parseUpdatedManga(updateManga, time, ids)
        mangaUpdatesFoundCallback(App.createMangaUpdates(returnObject))
    }
}