/* The Parser class in TypeScript is used to parse manga details, chapter lists, and chapter details
from a website. */
import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types'

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string, DOMAIN: string): SourceManga {
        const tags: Tag[] = [];

        $('.genres > a').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = $(obj).attr('href') ?? label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = $('h1.manga-name').text().trim();
        const author = 'Đang cập nhật';
        const artist = 'Đang cập nhật';
        const image = DOMAIN + $('.manga-poster > img').attr('src');
        const desc = $('.description > p').text();
        const status = $('.anisc-info > div:nth-child(2) > a').text();
        const rating = parseFloat($('.rating-result > .rr-mark > strong').text().trim());

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [titles],
                author,
                artist,
                image,
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
                rating: Number.isNaN(rating) ? 0 : rating
            })
        })
    }

    parseChapterList($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];

        $('.chapters-list-ul > ul > li').each((_: any, obj: any) => {
            const id = String($('a', obj).attr('href'));
            const group = $('a .chapter-view', obj).text();
            const name = $('a h1', obj).text().trim();
            const chapNum = $('a h1', obj).text().trim().split(' ').pop();

            chapters.push(App.createChapter({
                id,
                chapNum: parseFloat(String(chapNum)),
                name,
                langCode: '🇻🇳',
                group
            }));
        });

        if (this.parseChapterList.length == 0) {
            throw new Error('No chapter found');
        }

        console.log(chapters)

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('.chapter-content > img').each((_: any, obj: any) => {
            if (!obj.attribs['data-original']) return;
            const link = obj.attribs['data-original'];
            pages.push(link.indexOf('https') === -1 ? 'https:' + link : link);
        });

        return pages;
    }

    parseSearchResults($: CheerioStatic, DOMAIN: any): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];
        $('div.item-spc', 'div.mls-wrap').each((_: any, manga: any) => {
            const title = $('div > h3 > a', manga).text().trim();
            const id = $('div > h3 > a', manga).attr('href');
            let image = $('.manga-poster img', manga).attr('data-src');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : DOMAIN + image;
            const subtitle = $('div > .fd-list > div', manga).first().text().trim();
            if (!id || !title) return;

            tiles.push(App.createPartialSourceManga({
                mangaId: String(id),
                image,
                title,
                subtitle
            }));
        });

        return tiles;
    }

    parseTags($: any): TagSection[] {
        const arrayTag: Tag[] = [];
        const arrayTag2: Tag[] = [];
        const arrayTag3: Tag[] = [];

        // The loai
        $('div', '.cmbg-wrap').each((_: any, tag: any) => {
            const label = $(tag).text().trim();
            const id = $(tag).attr('data-id') ?? label;
            if (!id || !label) return;
            arrayTag.push({ id: id, label: label})
        });

        // filter
        $('.cmb-status div div select option').each((_: any, tag: any) => {
            const label = $(tag).text().trim();
            const id = 'status.' + $(tag).attr('value') ?? label;
            if (!id || !label) return;
            arrayTag2.push({ id: id, label: label});
        });

        $('.cmb-sort div div select option').each((_: any, tag: any) => {
            const label = $(tag).text().trim();
            const id = 'sort.' + $(tag).attr('value') ?? label;
            if (!id || !label) return;
            arrayTag3.push({ id: id, label: label})
        })

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể Loại (Có thể chọn nhiều hơn 1)', tags: arrayTag.map(x => App.createTag(x))}),
            App.createTagSection({ id: '1', label: 'Tình Trạng (Chỉ chọn 1)', tags: arrayTag2.map(x => App.createTag(x))}),
            App.createTagSection({ id: '2', label: 'Sắp xếp theo (Chỉ chọn 1)', tags: arrayTag3.map(x => App.createTag(x))})
        ]

        return tagSections;
    }
}