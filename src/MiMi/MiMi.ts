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

import { Parser } from './MiMiParser';

export const MiMiInfo: SourceInfo = {
    version: '1.0.1',
    name: 'MiMi',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from MiMi',
    websiteBaseURL: 'https://mimimoe.moe',
    contentRating: ContentRating.MATURE,
    sourceTags: [
        {
            text: 'Vietnamese',
            type: BadgeColor.BLUE
        },
        {
            text: '18+',
            type: BadgeColor.RED
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
};

const BASE_URL = 'https://mimimoe.moe';
const API_URL = `${BASE_URL}/api`;

export class MiMi implements ChapterProviding, MangaProviding, SearchResultsProviding, HomePageSectionsProviding {

    parser = new Parser();

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 3,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${BASE_URL}/`,
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

    private async apiRequest(endpoint: string, params = ''): Promise<any> {
        const url = `${API_URL}/${endpoint}${params ? `?${params}` : ''}`;
        const request = App.createRequest({
            url,
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        const response = await this.requestManager.schedule(request, 1);
        if (!response.data) {
            throw new Error('API response data is empty or undefined.');
        }
        return JSON.parse(response.data as string);
    }

    getMangaShareUrl(mangaId: string): string {
        return `${BASE_URL}/manga/${mangaId}`;
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const response = await this.apiRequest(`manga/${mangaId}`);
        return this.parser.parseMangaDetails(response, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const response = await this.apiRequest(`manga/${mangaId}/chapters`);
        return this.parser.parseChaptersList(response, mangaId);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        // chapterId is stored as "mangaId/chapterId"
        const realChapterId = chapterId.includes('/') ? chapterId.split('/')[1] : chapterId;
        const response = await this.apiRequest(`chapters/${realChapterId}`);
        const pages = this.parser.parseChapterDetails(response);
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;
        const tag = query.includedTags?.[0]?.id;

        let endpoint: string;
        let params: string;

        if (query.title) {
            endpoint = 'manga/search';
            params = `title=${encodeURIComponent(query.title)}&page=${page}&page_size=24`;
        } else if (tag) {
            endpoint = 'manga/advanced-search';
            params = `genre=${tag}&page=${page}&page_size=24`;
        } else {
            endpoint = 'manga/search';
            params = `page=${page}&page_size=24`;
        }

        const response = await this.apiRequest(endpoint, params);
        const mangas = this.parser.parseSearchResults(response.items ?? []);
        const hasNextPage = response.has_next ?? false;

        metadata = hasNextPage ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: mangas,
            metadata,
        });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        const sections = [
            App.createHomeSection({ id: 'popular', title: 'Phổ Biến Nhất', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
            App.createHomeSection({ id: 'latest', title: 'Mới Cập Nhật', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
        ];

        for (const section of sections) {
            sectionCallback(section);
            let response;

            switch (section.id) {
                case 'popular':
                    response = await this.apiRequest('manga', 'sort=views&exclude_genre=196&page=1&page_size=25');
                    break;
                case 'latest':
                    response = await this.apiRequest('manga', 'sort=updated_at&exclude_genre=196&page=1&page_size=25');
                    break;
                default:
                    continue;
            }

            section.items = this.parser.parseSearchResults(response.items ?? []);
            sectionCallback(section);
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        const page = metadata?.page ?? 1;
        let response;

        switch (homepageSectionId) {
            case 'popular':
                response = await this.apiRequest('manga', `sort=views&exclude_genre=196&page=${page}&page_size=25`);
                break;
            case 'latest':
                response = await this.apiRequest('manga', `sort=updated_at&exclude_genre=196&page=${page}&page_size=25`);
                break;
            default:
                throw new Error('Invalid section ID');
        }

        const mangas = this.parser.parseSearchResults(response.items ?? []);
        const hasNextPage = response.has_next ?? false;
        metadata = hasNextPage ? { page: page + 1 } : undefined;

        return App.createPagedResults({
            results: mangas,
            metadata,
        });
    }

    async getSearchTags(): Promise<TagSection[]> {
        // Attempt to fetch genres dynamically; fall back to empty if unavailable
        try {
            const response = await this.apiRequest('genres');
            return this.parser.parseTags(response);
        } catch {
            return this.parser.parseTags([]);
        }
    }
}