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

import { Parser } from './TruyenQQParser';

const DOMAIN = 'https://truyenqqko.com/';

export const isLastPage = ($: CheerioStatic): boolean => {
    const current = $('div.page_redirect > a > p.active').text();
    const lastLinkHref = $('div.page_redirect > a').last().attr('href');

    if (current && lastLinkHref) {
        const total = lastLinkHref.match(/trang-(\d+)\.html/)?.[1];
        if (total) {
            return (+total) === (+current); // Convert values to numbers and compare
        }
    }
    return true;
};

export const TruyenQQInfo: SourceInfo = {
    version: '1.1.3',
    name: 'TruyenQQ',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois/',
    description: 'Extension that pulls manga from TruyenQQ.',
    contentRating: ContentRating.EVERYONE,
    websiteBaseURL: DOMAIN,
    sourceTags: [
        {
            text: 'Recommended',
            type: BadgeColor.BLUE
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.CLOUDFLARE_BYPASS_REQUIRED
};

export class TruyenQQ implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {

    constructor(private cheerio: CheerioAPI) { }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 2,
        requestTimeout: 50000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': DOMAIN,
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                        // 'user-agent': 'a',
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
        const response = await this.requestManager.schedule(request, 1);
        this.CloudFlareError(response.status);
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
        });
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true;
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;

        const search = {
            genres: '',
            exgenres: '',
            country: '0',
            status: '-1',
            minchapter: '0',
            sort: '0'
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
                const [key, val] = value.split('.');
                switch (key) {
                    case 'minchapter':
                        search.minchapter = String(val);
                        break;
                    case 'country':
                        search.country = String(val);
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
        search.genres = genres.join(',');
        search.exgenres = exgenres.join(',');
        const paramExgenres = search.exgenres ? `&notcategory==${search.exgenres}` : '';

        const url = `${DOMAIN}${query.title ? 'tim-kiem' : 'tim-kiem-nang-cao'}/trang-${page}.html`;
        const param = encodeURI(
            `?q=${query.title ?? ''}
            &category=${search.genres}${paramExgenres}
            &country=${search.country}&status=${search.status}
            &minchapter=${search.minchapter}&sort=${search.sort}`
        );
        const $ = await this.DOMHTML(url + param);
        const tiles = this.parser.parseSearchResults($);
        metadata = !isLastPage($) ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: tiles,
            metadata
        });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('TruyenQQ Running...');
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: 'Truyện Đề Cử', containsMoreItems: false, type: HomeSectionType.featured }),
            App.createHomeSection({ id: 'hot', title: 'Truyện Yêu Thích', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_updated', title: 'Truyện Mới Cập Nhật', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_added', title: 'Truyện Mới Thêm Gần Đây', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'full', title: 'Truyện Đã Hoàn Thành', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'featured':
                    url = `${DOMAIN}`;
                    break;
                case 'hot':
                    url = `${DOMAIN}truyen-yeu-thich.html`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}truyen-moi-cap-nhat.html`;
                    break;
                case 'new_added':
                    url = `${DOMAIN}truyen-tranh-moi.html`;
                    break;
                case 'full':
                    url = `${DOMAIN}truyen-hoan-thanh.html`;
                    break;
                default:
                    throw new Error('Invalid homepage section ID');
            }

            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'featured':
                    section.items = this.parser.parseFeaturedSection($);
                    break;
                case 'hot':
                    section.items = this.parser.parseSearchResults($);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseSearchResults($);
                    break;
                case 'new_added':
                    section.items = this.parser.parseSearchResults($);
                    break;
                case 'full':
                    section.items = this.parser.parseSearchResults($);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page: number = metadata?.page ?? 1;
        let param = '';
        let url = '';

        switch (homepageSectionId) {
            case 'hot':
                param = `trang-${page}.html`;
                url = `${DOMAIN}truyen-yeu-thich/`;
                break;
            case 'new_updated':
                param = `trang-${page}.html`;
                url = `${DOMAIN}truyen-moi-cap-nhat/`;
                break;
            case 'new_added':
                param = `trang-${page}.html`;
                url = `${DOMAIN}truyen-tranh-moi/`;
                break;
            case 'full':
                param = `trang-${page}.html?status=2`;
                url = `${DOMAIN}truyen-hoan-thanh/`;
                break;
            default:
                throw new Error('Requested to getViewMoreItems for a section ID which doesn\'t exist');
        }

        const request = App.createRequest({
            url,
            method: 'GET',
            param,
        });

        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data as string);

        const manga = this.parser.parseSearchResults($);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results: manga,
            metadata
        });
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = `${DOMAIN}tim-kiem-nang-cao.html`;
        const $ = await this.DOMHTML(url);
        return this.parser.parseTags($);
    }

    CloudFlareError(status: number): void {
        if (status == 503 || status == 403) {
            throw new Error(`CLOUDFLARE BYPASS ERROR:\nPlease go to home page ${TruyenQQ.name} source and press the cloud icon.`);
        }
    }

    async getCloudflareBypassRequestAsync(): Promise<Request> {
        return App.createRequest({
            url: DOMAIN,
            method: 'GET',
            headers: {
                'referer': `${DOMAIN}/`,
                'origin': `${DOMAIN}/`,
                'user-agent': await this.requestManager.getDefaultUserAgent()
            }
        });
    }
}