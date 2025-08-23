(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Sources = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
// import {
//     TagSection,
//     SourceManga,
//     Chapter,
//     ChapterDetails,
//     HomeSection,
//     HomeSectionType,
//     SearchRequest,
//     PagedResults,
//     Request,
//     Response,
//     ChapterProviding,
//     MangaProviding,
//     SearchResultsProviding,
//     HomePageSectionsProviding,
//     SourceInfo,
//     ContentRating,
//     SourceIntents,
// } from '@paperback/types';
// import { Parser } from './TimTruyen3sParser';
// const DOMAIN = 'https://timtruyen3s.xyz/';
// export const isLastPage = ($: CheerioStatic): boolean => {
//     const current = $('ul > .page-item.active > a').attr('data-page') ?? '';
//     const last = $('ul > .page-item > a').last().attr('data-page');
//     if (last) {
//         return (+last) === (+current);
//     }
//     return true;
// }
// export const TimTruyen3sInfo: SourceInfo = {
//     version: '1.0.3',
//     name: 'TimTruyen3s',
//     icon: 'icon.png',
//     author: 'AlanNois',
//     authorWebsite: 'https://github.com/AlanNois/',
//     description: 'Extension that pulls manga from TimTruyen3s',
//     contentRating: ContentRating.EVERYONE,
//     websiteBaseURL: DOMAIN,
//     intents: SourceIntents.MANGA_CHAPTERS | SourceIntents.HOMEPAGE_SECTIONS
// }
// export class TimTruyen3s implements SearchResultsProviding, MangaProviding, ChapterProviding, HomePageSectionsProviding {
//     constructor(private cheerio: CheerioAPI) { }
//     readonly requestManager = App.createRequestManager({
//         requestsPerSecond: 5,
//         requestTimeout: 50000,
//         interceptor: {
//             interceptRequest: async (request: Request): Promise<Request> => {
//                 request.headers = {
//                     ...(request.headers ?? {}),
//                     ...{
//                         'referer': DOMAIN,
//                         'user-agent': await this.requestManager.getDefaultUserAgent(),
//                     }
//                 };
//                 return request;
//             },
//             interceptResponse: async (response: Response): Promise<Response> => {
//                 return response;
//             }
//         }
//     });
//     getMangaShareUrl(mangaId: string): string {
//         return `${DOMAIN}${mangaId}`;
//     }
//     parser = new Parser()
//     private async DOMHTML(url: string): Promise<CheerioStatic> {
//         const request = App.createRequest({
//             url: url,
//             method: 'GET',
//         });
//         const response = await this.requestManager.schedule(request, 2);
//         return this.cheerio.load(response.data as string)
//     }
//     async getMangaDetails(mangaId: string): Promise<SourceManga> {
//         const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
//         return this.parser.parseMangaDetails($, mangaId, DOMAIN);
//     }
//     async getChapters(mangaId: string): Promise<Chapter[]> {
//         const $ = await this.DOMHTML(`${DOMAIN}${mangaId}`);
//         return this.parser.parseChapterList($);
//     }
//     async getChapterDetails(mangaId: string, chapterId: string): Promise<ChapterDetails> {
//         const $ = await this.DOMHTML(`${DOMAIN}${chapterId}`);
//         const pages = this.parser.parseChapterDetails($);
//         return App.createChapterDetails({
//             id: chapterId,
//             mangaId,
//             pages
//         })
//     }
//     async getSearchResults(query: SearchRequest, metadata: any): Promise<PagedResults> {
//         let page = metadata?.page ?? 1;
//         const search = {
//             genres: '',
//             status: '',
//             sort: '',
//         };
//         const tags = query.includedTags?.map(tag => tag.id) ?? [];
//         const genres: string[] = [];
//         for (const value of tags) {
//             if (value.indexOf('.') === -1) {
//                 genres.push(value);
//             } else {
//                 const [key, val] = value.split(".");
//                 switch (key) {
//                     case 'status':
//                         search.status = String(val);
//                         break;
//                     case 'sort':
//                         search.sort = String(val);
//                         break;
//                 }
//             }
//         }
//         search.genres = genres.join("%2C");
//         const url = `${DOMAIN}danh-sach-truyen.html`
//         const param = encodeURI(`?name=${query.title ?? ''}&m_status=${search.status}&sort=${search.sort}&genre=${search.genres}`)
//         const $ = await this.DOMHTML(url + param);
//         const tiles = this.parser.parseSearchResults($, DOMAIN);
//         metadata = !isLastPage($) ? { page: page + 1 } : undefined;
//         return App.createPagedResults({
//             results: tiles,
//             metadata
//         })
//     }
//     async getHomePageSections(sectionCallback: (section: HomeSection) => void): Promise<void> {
//         console.log('TimTruyen3s Running...');
//         const sections: HomeSection[] = [
//             App.createHomeSection({ id: 'viewest', title: 'Truyện Xem Nhiều Nhất', containsMoreItems: true, type: HomeSectionType.singleRowNormal }),
//             App.createHomeSection({ id: 'new_updated', title: 'Truyện Mới Thêm Gần Đây', containsMoreItems: true, type: HomeSectionType.singleRowLarge })
//         ];
//         for (const section of sections) {
//             sectionCallback(section);
//             let url: string;
//             switch (section.id) {
//                 case 'viewest':
//                     url = `${DOMAIN}danh-sach-truyen.html?page=1&author=&group=&m_status=&name=&genre=&sort=views&sort_type=DESC`
//                     break;
//                 case 'new_updated':
//                     url = `${DOMAIN}danh-sach-truyen.html?page=1&author=&group=&m_status=&name=&genre=&sort=last_update&sort_type=DESC`;
//                     break;
//                 default:
//                     throw new Error('Invalid homepage section ID')
//             }
//             const $ = await this.DOMHTML(url);
//             section.items = this.parser.parseSearchResults($, DOMAIN);
//             sectionCallback(section);
//         }
//     }
//     async getViewMoreItems(homepageSectionId: string, metadata: any): Promise<PagedResults> {
//         let page: number = metadata?.page ?? 1;
//         let url = '';
//         switch (homepageSectionId) {
//             case 'viewest':
//                 url = `${DOMAIN}danh-sach-truyen.html?page=${page}&author=&group=&m_status=&name=&genre=&sort=views&sort_type=DESC`
//                 break;
//             case 'new_updated':
//                 url = `${DOMAIN}danh-sach-truyen.html?page=${page}&author=&group=&m_status=&name=&genre=&sort=last_update&sort_type=DESC`;
//                 break;
//             default:
//                 throw new Error("Requested to getViewMoreItems for a section ID which doesn't exist");
//         }
//         const $ = await this.DOMHTML(url);
//         const manga = this.parser.parseSearchResults($, DOMAIN);
//         metadata = isLastPage($) ? undefined : { page: page + 1 };
//         return App.createPagedResults({
//             results: manga,
//             metadata
//         });
//     }
//     async getSearchTags(): Promise<TagSection[]> {
//         const url = `${DOMAIN}search`;
//         const $ = await this.DOMHTML(url);
//         return this.parser.parseTags($);
//     }
// }

},{}]},{},[1])(1)
});
