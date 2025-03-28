// import {
//     Chapter,
//     SourceManga,
//     Tag,
//     TagSection,
//     MangaUpdates,
//     PartialSourceManga,
//     ChapterProviding
// } from '@paperback/types'

// export class Parser {

//     parseMangaDetails($: any, mangaId: string): SourceManga {
//         const tags: Tag[] = []

//         $.data.tags.forEach((tag: any) => {
//             const label = tag.name
//             const id = tag.slug
//             tags.push(App.createTag({ label, id }))
//         });

//         const titles: string[] = $.data.titles.map((tag: any) => tag.name);
//         const author = String($.data.author.name);
//         const artist = String($.data.team.name);
//         const image = String($.data.cover_url);
//         const banner = String($.data.panorama_url);
//         const desc = String($.data.full_description);
//         const status = 'UNKNOWN';

//         return App.createSourceManga({
//             id: mangaId,
//             mangaInfo: App.createMangaInfo({
//                 titles,
//                 author,
//                 artist,
//                 image,
//                 banner,
//                 desc,
//                 tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
//                 status
//             })
//         })
//     }

//     parseChapterList($: any): Chapter[] {
//         const chapters: Chapter[] = []

//         $.data.forEach((obj: any) => {
//             const id = `chapters/${obj.id}`;
//             const time = new Date(obj.updated_at);
//             const group = obj.views_count;
//             const name = `Chapter ${obj.number}`;
//             const chapNum = obj.number

//             chapters.push(App.createChapter({
//                 id,
//                 chapNum,
//                 name,
//                 langCode: '🇻🇳',
//                 time,
//                 group: `${group} lượt xem`
//             }));
//         });

//         if (chapters.length == 0) {
//             throw new Error('No chapters found');
//         }

//         return chapters;
//     }

//     parseChapterDetails($: any): string[] {
//         const pages: string[] = [];

//         $.data.pages.forEach((obj: any) => {
//             const link = `${obj.image_url}/#drm_data=${obj.drm_data}`
//             pages.push(link)
//         });

//         return pages;
//     }
// }