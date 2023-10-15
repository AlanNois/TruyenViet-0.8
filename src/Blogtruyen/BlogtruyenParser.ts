import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types'

const entities = require('entities');

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        let author = '';
        let artist = '';

        $('p', '.descripton').each((_: any, obj: any) => {
            switch ($(obj).clone().children().remove().end().text().trim()) {
                case 'Tác giả:':
                    author = this.decodeHTMLEntity($('a', obj).text().trim());
                    artist = this.decodeHTMLEntity($('a', obj).text().trim());
                    break;
                case 'Thể loại:':
                    $('.category > a', obj).each((_: any, genres: any) => {
                        const genre = $(genres).text().trim();
                        const id = $(genres).attr('href') ?? genre;
                        tags.push(App.createTag({ label: genre, id }));
                    });
            }
        })

        const title = [this.decodeHTMLEntity($('.entry-title > a').text().trim())]
        const desc = $('.content').text();
        const image = encodeURI(String($('.thumbnail > img').attr('src'))) ?? "https://i.imgur.com/GYUxEX8.png";
        const status = this.decodeHTMLEntity($('.description > p > .color-red:last-child').text().trim());

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: title,
                author,
                artist,
                image,
                covers: [image],
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genres', tags: tags })]
            })
        })
    }

    parseChapters($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];

        var chapNum = 0;
        $('#list-chapters > p').get().reverse().forEach((obj) => {
            const time_raw = $('.publishedDate', obj).text().trim();
            const time = this.convert_time(time_raw);
            const id = String($('span > a', obj).attr('href'));
            const name = this.decodeHTMLEntity($('span > a', obj).text().trim());

            chapters.push(App.createChapter({
                id,
                chapNum,
                name,
                time,
                langCode: '🇻🇳',
            }));
            chapNum++;
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('#content > img').each((_: any, obj: any) => {
            if (!obj.attribs['src']) return;
            const link = obj.attribs['src'];
            pages.push(link);
        });

        return pages;
    }

    parseSearchResults($: CheerioStatic): PartialSourceManga[] {
        const results: PartialSourceManga[] = [];

        $('p:not(:first-child)', '.list').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('a', obj).text().trim());
            const subtitle = 'Chương ' + this.decodeHTMLEntity($('span:nth-child(2)', obj).text().trim());
            const image = $('img', $(obj).next()).attr('src') || "https://i.imgur.com/GYUxEX8.png";
            const mangaId = String($('a', obj).attr('href'));
            if (!mangaId || !title) return;

            results.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }))
        });

        return results;
    }

    parseFeaturedSection($: CheerioStatic): PartialSourceManga[] {
        const featuredItems: PartialSourceManga[] = [];

        $('a', '#storyPinked').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('p:first-child', $(obj).next()).text().trim());
            const mangaId = String($(obj).attr('href'));
            const image = $('img', obj).attr('src')?.replace('300x300', '500x') || "https://i.imgur.com/GYUxEX8.png";
            const subtitle = this.decodeHTMLEntity($('p:last-child', $(obj).next()).text().trim());
            if (!mangaId || !title) return;

            featuredItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }))
        });

        return featuredItems;
    }

    parseAjaxSection($: CheerioStatic): PartialSourceManga[] {
        const ajaxItems: PartialSourceManga[] = [];

        $('p:not(:first-child)', '.list').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('a', obj).text().trim());
            const subtitle = 'Chương ' + this.decodeHTMLEntity($('span:nth-child(2)', obj).text().trim());
            const image = $('img', $(obj).next()).attr('src') || "https://i.imgur.com/GYUxEX8.png";
            const mangaId = String($('a', obj).attr('href'));
            if (!mangaId || !title) return;

            ajaxItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return ajaxItems;
    }

    parseNewUpdatedSection($: CheerioStatic): PartialSourceManga[] {
        const newUpdatedItems: PartialSourceManga[] = [];

        $('.row', '.list-mainpage .storyitem').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity(String($('h3.title > a', obj).attr('title')).trim());
            const subtitle = this.decodeHTMLEntity($('div:nth-child(2) > div:nth-child(4) > span:nth-child(1) > .color-red', obj).text());
            const image = String($('div:nth-child(1) > a > img', obj).attr('src'));
            const mangaId = $('div:nth-child(1) > a', obj).attr('href') ?? title;
            if (!mangaId || !title) return;

            newUpdatedItems.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return newUpdatedItems;
    }

    parseViewMoreSection($: CheerioStatic, homepageSectionId: any): PartialSourceManga[] {
        switch (homepageSectionId) {
            case 'featured':
                return this.parseFeaturedSection($);
            case 'hot':
                return this.parseAjaxSection($);
            case 'new_updated':
                return this.parseNewUpdatedSection($);
            default:
                return [];
        }
    }

    parseTags($: CheerioStatic): TagSection[] {
        const arrayTags: Tag[] = [];
        const arrayTags2: Tag[] = [];

        // The loai
        for (const tag of $('li', '.list-unstyled.row').toArray()) {
            const label = this.decodeHTMLEntity($(tag).text().trim());
            const id = $(tag).attr('data-id') ?? label;
            if (!id || !label) continue;
            arrayTags.push({ id: id, label: label });
        }

        // Tinh trang
        for (const tag of $('option', '#Status').toArray()) {
            const label = this.decodeHTMLEntity($(tag).text().trim());
            let id: string;
            switch (label) {
                case 'Sao cũng được':
                    id = 'anything' + $(tag).attr('value') ?? label;
                    break;
                case 'Đang tiến hành':
                    id = 'ongoing' + $(tag).attr('value') ?? label;
                    break;
                case 'Đã hoàn thành':
                    id = 'completed' + $(tag).attr('value') ?? label;
                    break;
                case 'Tạm ngưng':
                    id = 'drop' + $(tag).attr('value') ?? label;
                    break;
                default:
                    id = $(tag).attr('value') ?? label;
            }
            if (!id || !label) continue;
            arrayTags2.push({ id: id, label: label });
        }

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể loại (Chọn nhiều)', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Tình trạng (Chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
        ];

        return tagSections;
    }

    private decodeHTMLEntity = (str: string): string => {
        return entities.decodeHTML(str);
    };

    private convert_time = (timeAgo: string): Date => {
        const [D, H] = timeAgo.split(' ');
        const fixD = String(D).split('/');
        const finalD = `${fixD[1]}/${fixD[0]}/${fixD[2]}`;
        return new Date(`${finalD} ${H}`)
    }
}