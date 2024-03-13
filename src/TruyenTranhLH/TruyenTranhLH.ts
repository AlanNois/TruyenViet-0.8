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

import { Parser } from './TruyenTranhLHParser';

const DOMAIN = 'https://truyenlh.com/';

export const isLastPage = ($: CheerioStatic): boolean => {
    const current = $('.pagination_wrap > a.current').text();
    const lastPage = $('.pagination_wrap > a.next').attr('href')?.split('=').pop();
    return (+current) === (+String(lastPage))
}

// export const TruyenTranhLHInfo: SourceInfo = {
//     version: '1.0.3',
//     name: 'TruyenTranhLH',
//     icon: 'icon.png',
//     author: 'AlanNois',
//     authorWebsite: 'https://github.com/AlanNois/',
//     description: 'Extension that pulls manga from TruyenTranhLH',
//     contentRating: ContentRating.MATURE,
//     websiteBaseURL: DOMAIN,
//     sourceTags: [
//         {
//             text: 'Recommended',
//             type: BadgeColor.BLUE
//         }
//     ],
//     intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
// };

export class TruyenTranhLH implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
    constructor(private cheerio: CheerioAPI) { }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 4,
        requestTimeout: 20000,
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
        return `${DOMAIN}truyen-tranh/${mangaId}`
    }

    parser = new Parser()

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
        const $ = await this.DOMHTML(`${DOMAIN}truyen-tranh/${chapterId}`)
        const pages = this.parser.parseChapterDetails($);
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages
        })
    }

    async supportsTagExclusion(): Promise<boolean> {
        return true
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;

        const search = {
            status: "",
            sort: "update",
            genres: "",
            exgenres: ""
        };

        const extags = query.excludedTags?.map(tag => tag.id) ?? [];
        const exgenres: string[] = [];
        for (const value of extags) {
            if (value.indexOf('.') === -1) {
                exgenres.push(value)
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
                    case 'sort':
                        search.sort = String(val)
                        break
                    case 'status':
                        search.status = String(val)
                        break
                }
            }
        }

        search.genres = genres.join(",");
        search.exgenres = exgenres.join(",");

        const url = `${DOMAIN}tim-kiem`
        const param = encodeURI(`?q=${query.title ?? ''}&status=${search.status ?? ''}&sort=${search.sort}&accept_genres=${search.genres}&reject_genres=${search.exgenres}&page=${page}`)
        const $ = await this.DOMHTML(url + param);
        const tiles = this.parser.parseSearchResults($);
        metadata = !isLastPage($) ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: tiles,
            metadata
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('TruyenTranhLH Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'hot', title: "Truyện hot trong ngày", containsMoreItems: false, type: HomeSectionType.featured }),
            App.createHomeSection({ id: 'new_updated', title: "Truyện mới cập nhật", containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'new_added', title: "Truyện mới nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal })
        ];

        for (const section of sections) {
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'hot':
                    url = `${DOMAIN}`;
                    break
                case 'new_updated':
                    url = `${DOMAIN}tim-kiem?sort=update`;
                    break;
                case 'new_added':
                    url = `${DOMAIN}tim-kiem?sort=new`;
                    break;
                default:
                    throw new Error("Invalid homepage section ID");
            }

            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'hot':
                    section.items = this.parser.parseHotSection($);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseSearchResults($);
                    break;
                case 'new_added':
                    section.items = this.parser.parseSearchResults($);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;
        let url: string;
        switch (homepageSectionId) {
            case "new_updated":
                url = `${DOMAIN}tim-kiem?sort=update&page=${page}`;
                break;
            case "new_added":
                url = `${DOMAIN}tim-kiem?sort=new&page=${page}`;
                break;
            default:
                throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
        }

        const $ = await this.DOMHTML(url)

        const manga = this.parser.parseSearchResults($);
        metadata = isLastPage($) ? undefined : { page: page + 1 };

        return App.createPagedResults({
            results: manga,
            metadata
        });
    }

    async getSearchTags(): Promise<TagSection[]> {
        const url = `${DOMAIN}tim-kiem`;
        const $ = await this.DOMHTML(url);
        return this.parser.parseTags($);
    }
}