import {
    MangaUpdates,
    Tag,
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

import { Parser } from './BaoTangTruyenTranhParser';

const DOMAIN = 'https://baotangtruyen4.com/';

export const isLastPage = ($: CheerioStatic): boolean => {
    const pages: number[] = [];
    $("li", "ul.pagination").each((_, page) => {
        const p = Number($('a', page).text().trim());
        if (!isNaN(p)) {
            pages.push(p);
        }
    });
    const lastPage = Math.max(...pages);
    const currentPage = Number($("ul.pagination > li.active > a").text().trim());
    return currentPage >= lastPage;
}

export const BaoTangTruyenTranhInfo: SourceInfo = {
    version: '1.0.1',
    name: 'BaoTangTruyenTranh',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from BaoTangTruyenTranh',
    websiteBaseURL: DOMAIN,
    contentRating: ContentRating.EVERYONE,
    sourceTags: [
        {
            text: 'Notifications',
            type: BadgeColor.GREEN,
        },
        {
            text: "Recommended",
            type: BadgeColor.BLUE,
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
}

export class BaoTangTruyenTranh implements ChapterProviding, MangaProviding, SearchResultsProviding, HomePageSectionsProviding {
    
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
        const StoryID = mangaId.split('-').pop();
        const request = App.createRequest({
            url: `${DOMAIN}Story/ListChapterByStoryID`,
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'referer': DOMAIN,
            },
            data: { StoryID }
        });

        const response = await this.requestManager.schedule(request, 1);
        const $ = this.cheerio.load(response.data as string);
        return this.parser.parseChapterList($, mangaId);
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

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;
        const tags = query.includedTags?.map((tag) => tag.id) ?? [];
        const search = {
            cate: "",
            status: "-1",
            sort: "0",
        };

        tags.forEach((value) => {
            const [key, val] = value.split('.');
            switch (key) {
                case 'cate':
                    search.cate = String(val);
                    break;
                case 'status':
                    search.status = String(val);
                    break;
                case 'sort':
                    search.sort = String(val);
                    break;
            }
        });

        const searchUrl = query.title
            ? `${DOMAIN}tim-truyen?keyword=${query.title}&page=${page}`
            : `${DOMAIN}tim-truyen?page=${page}&cate=${search.cate}&status=${search.status}&sort=${search.sort}`;
        const url = encodeURI(searchUrl);
        const $ = await this.DOMHTML(url);
        const tiles = this.parser.parseSearchResults($);
        metadata = !isLastPage($) ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: tiles,
            metadata,
        })
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log('BaoTangTruyenTranh Running...')
        const sections: HomeSection[] = [
            App.createHomeSection({ id: 'featured', title: 'TRUYỆN ĐỀ CỬ', containsMoreItems: false, type: HomeSectionType.featured}),
            App.createHomeSection({ id: 'new_updated', title: 'TRUYỆN MỚI CẬP NHẬT', containsMoreItems: true, type: HomeSectionType.singleRowNormal}),
            App.createHomeSection({ id: 'trans', title: 'TRUYỆN DỊCH', containsMoreItems: true, type: HomeSectionType.singleRowNormal})
        ];

        for (const section of sections){
            sectionCallback(section);
            let url: string;
            switch (section.id) {
                case 'featured':
                    url = `${DOMAIN}`;
                    break;
                case 'new_updated':
                    url = `${DOMAIN}home?page=1&typegroup=0`;
                    break;
                case 'trans':
                    url = `${DOMAIN}home?page=1&typegroup=1`;
                    break;
                default:
                    throw new Error("Invalid home section ID");
            }

            const $ = await this.DOMHTML(url);
            switch (section.id) {
                case 'featured':
                    section.items = this.parser.parseFeaturedSection($);
                    break;
                case 'new_updated':
                    section.items = this.parser.parseNewUpdatedSection($);
                    break;
                case 'trans':
                    section.items = this.parser.parseTransSection($);
                    break;
            }
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page: number = metadata?.page ?? 1;
        let url= '';
        // let select = 1;

        switch (homepageSectionId) {
            case 'new_updated':
                url = `${DOMAIN}/home?page=${page}&typegroup=0`;
                // select = 1;
                break;
            case 'trans':
                url = `${DOMAIN}/home?page=${page}&typegroup=1`;
                // select = 1;
                break;
            default:
                return App.createPagedResults({ results: [] });
        }

        const $ = await this.DOMHTML(url);
        const manga = this.parser.parseViewMore($);
        metadata = !isLastPage($) ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: manga,
            metadata,
        })
    }

    async getSearchTags(): Promise<TagSection[]> {
        const tags: Tag[] = [];
        const tags2: Tag[] = [
            {
                id: 'status.-1',
                label: 'Tất cả'
            },
            {
                id: 'status.2',
                label: 'Hoàn thành'
            },
            {
                id: 'status.1',
                label: 'Đang tiến hành'
            }
        ];
        const tags3 = [
            {
                id: 'sort.13',
                label: 'Top ngày'
            },
            {
                id: 'sort.12',
                label: 'Top tuần'
            },
            {
                id: 'sort.11',
                label: 'Top tháng'
            },
            {
                id: 'sort.10',
                label: 'Top all'
            },
            {
                id: 'sort.20',
                label: 'Theo dõi'
            },
            {
                id: 'sort.25',
                label: 'Bình luận'
            },
            {
                id: 'sort.15',
                label: 'Truyện mới'
            },
            {
                id: 'sort.30',
                label: 'Số chapter'
            },
            {
                id: 'sort.0',
                label: 'Ngày cập nhật'
            }
        ];

        const $ = await this.DOMHTML(DOMAIN);

        // Thể loại
        $('.megamenu .nav a').each((_, tag) => {
            const label = $(tag).text().trim();
            let id = 'cate.' + String($(tag).attr('href')).split('/').pop();
            if (label === 'Tất cả') id = 'cate.';
            if (id && label) {
                tags.push({ id, label: this.parser.decodeHTMLEntity(label) });
            }
        });

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '1', label: 'Thể Loại', tags: tags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Tình trạng', tags: tags2.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '3', label: 'Sắp xếp theo', tags: tags3.map(x => App.createTag(x)) }),
        ];

        return tagSections;
    } 

    async filterUpdatedManga(mangaUpdatesFoundCallback: (updates: MangaUpdates) => void, time: Date, ids: string[]): Promise<void> {
        const updatedManga: any = [];
        const pages = 10;

        for (let page = 1; page <= pages; page++) {
            const url = `${DOMAIN}/home?page=${page}&typegroup=0`;
            const $ = await this.DOMHTML(url);
            const updatedManga = $('.items-slide .item').toArray().map(element => {
                const id = $('a', element).attr('href')?.split('/').slice(-2).join('/');
                const time = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > i", element).last().text().trim();
                return {
                    id: id,
                    time: time,
                };
            });

            updatedManga.push(...updatedManga);
        }

        const returnObject = this.parser.parseUpdatedManga(updatedManga, time, ids);
        mangaUpdatesFoundCallback(App.createMangaUpdates(returnObject));
    }
}