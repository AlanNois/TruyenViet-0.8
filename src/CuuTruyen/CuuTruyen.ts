import {
    // MangaUpdates,
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
    DUISection,
} from '@paperback/types';

import { Parser } from './CuuTruyenParser';
import { getDomain, domainSettings, resetSettings } from './CuuTruyenSetting';
import { unscrambleImage } from './CuuTruyenDrm';

export const CuuTruyenInfo: SourceInfo = {
    version: '1.0.1',
    name: 'CuuTruyen',
    icon: 'icon.png',
    author: 'AlanNois',
    authorWebsite: 'https://github.com/AlanNois',
    description: 'Extension that pulls manga from Cuutruyen',
    websiteBaseURL: 'https://cuutruyen.net',
    contentRating: ContentRating.MATURE,
    sourceTags: [
        {
            text: 'Recommended',
            type: BadgeColor.GREEN
        },
        {
            text: 'DRM protected',
            type: BadgeColor.YELLOW
        }
    ],
    intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS | SourceIntents.SETTINGS_UI
};

export class CuuTruyen implements ChapterProviding, MangaProviding, SearchResultsProviding, HomePageSectionsProviding {

    stateManager = App.createSourceStateManager();
    parser = new Parser();

    private domainPromise: Promise<string>;

    constructor() {
        this.domainPromise = getDomain(this.stateManager);
    }

    private async getBaseUrl(): Promise<string> {
        const domain = await this.domainPromise;
        return `https://${domain}`;
    }

    private async getApiUrl(): Promise<string> {
        const domain = await this.domainPromise;
        return `https://${domain}/api/v2`;
    }

    readonly requestManager = App.createRequestManager({
        requestsPerSecond: 5,
        requestTimeout: 15000,
        interceptor: {
            interceptRequest: async (request: Request): Promise<Request> => {
                request.headers = {
                    ...(request.headers ?? {}),
                    ...{
                        'referer': `${await this.getBaseUrl()}/`,
                        'user-agent': await this.requestManager.getDefaultUserAgent(),
                    }
                };
                return request;
            },
            interceptResponse: async (response: Response): Promise<Response> => {
                // console.log(`Response URL: ${response.request.url}`);
                // Handle image DRM decryption
                if (response.request.url.includes('drm_data=')) {
                    const urlString = response.request.url;
                    let drmKey: string | null = null;

                    // Try to extract from query parameters
                    const queryStringIndex = urlString.indexOf('?');
                    if (queryStringIndex !== -1) {
                        const queryAndHash = urlString.substring(queryStringIndex + 1);
                        const hashIndexInQuery = queryAndHash.indexOf('#');
                        const queryString = hashIndexInQuery !== -1 ? queryAndHash.substring(0, hashIndexInQuery) : queryAndHash;

                        const drmDataParamIndex = queryString.indexOf('drm_data=');
                        if (drmDataParamIndex !== -1) {
                            const startIndex = drmDataParamIndex + 'drm_data='.length;
                            let endIndex = queryString.indexOf('&', startIndex);
                            if (endIndex === -1) {
                                endIndex = queryString.length;
                            }
                            drmKey = queryString.substring(startIndex, endIndex);
                        }
                    }

                    // If not found in query, try to extract from hash
                    if (!drmKey) {
                        const hashIndex = urlString.indexOf('#');
                        if (hashIndex !== -1) {
                            const hashString = urlString.substring(hashIndex + 1);
                            const drmDataHashIndex = hashString.indexOf('drm_data=');
                            if (drmDataHashIndex !== -1) {
                                const startIndex = drmDataHashIndex + 'drm_data='.length;
                                let endIndex = hashString.indexOf('&', startIndex);
                                if (endIndex === -1) {
                                    endIndex = hashString.length;
                                }
                                drmKey = hashString.substring(startIndex, endIndex);
                            }
                        }
                    }

                    // console.log(`DRM Key: ${drmKey}`);
                    if (drmKey && response.rawData) {
                        const decryptedData = await unscrambleImage(response.rawData, drmKey);
                        response.rawData = decryptedData;
                        // response.rawData = App.createRawData({ byteArray: await unscrambleImage(App.createByteArray(response.rawData ?? new Uint8Array()), drmKey) })
                    }
                }
                return response;
            }
        }
    });

    async getSourceMenu(): Promise<DUISection> {
        return App.createDUISection(
            {

                id: 'main',
                header: 'Source Settings',
                rows: async () => {
                    return [
                        domainSettings(this.stateManager),
                        resetSettings(this.stateManager)
                    ]
                },
                isHidden: false
            }
        )

    }

    getMangaShareUrl(mangaId: string): string {
        return `${this.getBaseUrl()}/mangas/${mangaId}`;
    }

    private async apiRequest(endpoint: string, params: string = ''): Promise<any> {
        const url = `${await this.getApiUrl()}/${endpoint}${params ? `?${params}` : ''}`;
        const request = App.createRequest({
            url,
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
            },
        });
        const response = await this.requestManager.schedule(request, 1);
        if (!response.data) {
            throw new Error('API response data is empty or undefined.');
        }
        return JSON.parse(response.data as string);
    }

    async getMangaDetails(mangaId: string): Promise<SourceManga> {
        const response = await this.apiRequest(`mangas/${mangaId}`);
        return this.parser.parseMangaDetails(response.data, mangaId);
    }

    async getChapters(mangaId: string): Promise<Chapter[]> {
        const response = await this.apiRequest(`mangas/${mangaId}/chapters`);
        return this.parser.parseChaptersList(response.data);
    }

    async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
        const response = await this.apiRequest(`chapters/${chapterId}`);
        const pages = this.parser.parseChapterDetails(response.data);
        return App.createChapterDetails({
            id: chapterId,
            mangaId,
            pages,
        });
    }

    async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;

        const tag = query.includedTags[0]?.id;
        let endpoint: string;
        let params: string;

        if (query.title) {
            endpoint = 'mangas/search';
            params = `q=${encodeURIComponent(query.title)}&page=${page}&per_page=50`;
        } else if (tag) {
            endpoint = `tags/${tag}`;
            params = `page=${page}&per_page=50`;
        } else {
            // Default case if neither title nor tag is provided
            endpoint = 'mangas/search';
            params = `q=&page=${page}&per_page=50`;
        }

        const response = await this.apiRequest(endpoint, params);
        let mangas;
        if (!tag) {
            mangas = this.parser.parseSearchResults(response.data);
        } else {
            mangas = this.parser.parseSearchResults(response.data.mangas);
        }

        const lastPage = response._metadata.total_pages;
        metadata = lastPage > page ? { page: page + 1 } : lastPage;

        return App.createPagedResults({
            results: mangas,
            metadata,
        });
    }

    async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
        console.log("CuuTruyen Running...")
        const sections = [
            App.createHomeSection({ id: 'popular', title: "Phổ Biến Nhất", containsMoreItems: true, type: HomeSectionType.singleRowNormal}),
            App.createHomeSection({ id: 'latest', title: "Mới Cập Nhật", containsMoreItems: true, type: HomeSectionType.singleRowNormal}),
            App.createHomeSection({ id: 'completed', title: "Đã Hoàn Thành", containsMoreItems: true, type: HomeSectionType.singleRowNormal})
        ];
        for (const section of sections) {
            sectionCallback(section); // Send initial section with no items
            let response;
            switch (section.id) {
                case 'popular':
                    response = await this.apiRequest('mangas/top', 'duiration=all&page=1&per_page=25');
                    break;
                case 'latest':
                    response = await this.apiRequest('mangas/recently_updated', 'page=1&per_page=25');
                    break;
                case 'completed':
                    response = await this.apiRequest('tags/da-hoan-thanh', 'page=1&per_page=25');
                    break;
                default:
                    continue;
            }

            if (section.id === 'completed') {
                section.items = this.parser.parseSearchResults(response.data.mangas);
            } else {
                section.items = this.parser.parseSearchResults(response.data);
            }

            sectionCallback(section); // Send section with items
        }
    }

    async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
        let page = metadata?.page ?? 1;
        let response;
        switch (homepageSectionId) {
            case 'popular':
                response = await this.apiRequest('mangas/top', `duiration=all&page=${page}&per_page=25`);
                break;
            case 'latest':
                response = await this.apiRequest('mangas/recently_updated', `page=${page}&per_page=25`);
                break;
            case 'completed':
                response = await this.apiRequest('tags/da-hoan-thanh', `page=${page}&per_page=25`);
                break;
            default:
                throw new Error('Invalid section ID');
        }

        let mangas;
        if (homepageSectionId === 'completed') {
            mangas = this.parser.parseSearchResults(response.data.mangas);
        } else {
            mangas = this.parser.parseSearchResults(response.data);
        }

        const lastPage = response._metadata.total_pages;
        metadata = lastPage > page ? {page : page + 1} : lastPage;

        return App.createPagedResults({
            results: mangas,
            metadata,
        });
    }

    async getSearchTags(): Promise<TagSection[]> {
        return this.parser.parseTags()
    }

}
