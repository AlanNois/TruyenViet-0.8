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
} from '@paperback/types';

import { Parser } from './BlogtruyenParser';

const DOMAIN = 'https://blogtruyen.vn/';

export const isLastPage = ($: CheerioStatic): boolean => {
    const lastPage = Number($('ul.pagination > li:last-child > a').attr('href')?.split('-').pop());
    const currentPage = Number($('ul.pagination > li > select > option').find(':selected').text().split(' ')[1]);

    return currentPage >= lastPage;
}

export const BlogtruyenInfo: SourceInfo = {
    version: '1.0.1',
    name: 'Blogtruyen',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github/AlanNois',
    description: 'Extension that pulls manga from Blogtruyen',
    websiteBaseURL: DOMAIN,
    contentRating: ContentRating.MATURE,
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}

export class Blogtruyen implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
    constructor(private cheerio: CheerioAPI) { }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...request.headers,
                    'Referer': DOMAIN,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                }
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

    private async DOMHTML(url: string): Promise<CheerioStatic> {
        const request = App.createRequest({
            url: url,
            method: 'GET',
        });

        const response = await this.requestManager.schedule(request, 1);
        return this.cheerio.load(response.data as string);
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
        return this.parser.parseMangaDetails($, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
        return this.parser.parseChapters($);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const $ = await this.DOMHTML(`${DOMAIN}${chapterId}`);
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

        const params = {
            genres: '',
            exgenres: '',
            status: '',
        }

        const tags = query.includedTags?.map((tag) => tag.id) ?? [];
        const extags = query.excludedTags?.map((tag) => tag.id) ?? [];

        const genres: string[] = [];
        const exgenres: string[] = [];

        for (const value of extags) {
            if (value.indexOf('.') === -1) {
                exgenres.push(value);
            }
        }

        for (const value of tags) {
            if (value.indexOf('.') === -1) {
                genres.push(value);
            } else {
                const [key, val] = value.split('.');
                switch (key) {
                    case 'anything':
                        params.status = String(val);
                        break;
                    case 'ongoing':
                        params.status = String(val);
                        break;
                    case 'completed':
                        params.status = String(val);
                        break;
                    case 'drop':
                        params.status = String(val);
                        break;
                }
            }
        }

        params.genres = genres.join(',');
        params.exgenres = exgenres.join(',');

        const param = encodeURI(`1/${params.status ? params.status : '0'}/${params.genres ? params.genres : '-1'}/${params.exgenres ? params.exgenres : '-1'}${query.title ? `?txt=${query.title}` : ''}${query.title ? `&p=${page}` : `?p=${page}`}`);
        const $ = await this.DOMHTML(`${DOMAIN}timkiem/nangcao/${param}`);

        const results = this.parser.parseSearchResults($);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results,
            metadata
        })

    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('Blogtruyen Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: "TRUYỆN ĐỀ CỬ", containsMoreItems: false, type: HomeSectionType.featured}),
            App.createHomeSection({ id: 'hot', title: "TRUYỆN XEM NHIỀU NHẤT", containsMoreItems: true, type: HomeSectionType.singleRowNormal}),
            App.createHomeSection({ id: 'new_updated', title: "TRUYỆN MỚI CẬP NHẬT", containsMoreItems: true, type: HomeSectionType.singleRowNormal}),
            App.createHomeSection({ id: 'full', title: "TRUYỆN ĐÃ HOÀN THÀNH", containsMoreItems: true, type: HomeSectionType.singleRowNormal})
        ]

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'featured':
                    url = DOMAIN;
                    break;
                case 'hot':
                    url = `${DOMAIN}ajax/Search/AjaxLoadListManga?key=tatca&orderBy=3&p=1`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}thumb`;
                    break;
                case 'full':
                    url = `${DOMAIN}ajax/Category/AjaxLoadMangaByCategory?id=0&orderBy=5&p=1`;
                    break;
                default:
                    throw new Error(`Invalid home section ID`);
            }

            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'featured':
                    section.items = this.parser.parseFeaturedSection($);
                    break;
                case 'hot':
                    section.items = this.parser.parseAjaxSection($);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseNewUpdatedSection($);
                    break;
                case 'full':
                    section.items = this.parser.parseAjaxSection($);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;
        let url = '';

        switch (homepageSectionId) {
            case 'hot':
                url = `${DOMAIN}ajax/Search/AjaxLoadListManga?key=tatca&orderBy=3&p=${page}`;
                break;
            case 'new_updated':
                url = `${DOMAIN}thumb-${page}`;
                break;
            case 'full':
                url = `${DOMAIN}ajax/Category/AjaxLoadMangaByCategory?id=0&orderBy=5&p=${page}`;
                break;
            default:
                throw new Error(`Invalid home section ID`);
        }

        const $ = await this.DOMHTML(url);
        const results = this.parser.parseViewMoreSection($, homepageSectionId);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results,
            metadata
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = `${DOMAIN}timkiem/nangcao`;
        const $ = await this.DOMHTML(url);
        return this.parser.parseTags($);
    }
}