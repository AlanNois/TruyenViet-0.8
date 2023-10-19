import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types'

const entities = require("entities");

export class Parser {
    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        let author = '';
        let artist = '';
        let status = '';
        let au_ar_txt: string[] = [];

        $('.info-item', '.series-information').each((_: any, obj: any) => {
            switch ($('.info-name', obj).text().trim()) {
                case 'Tác giả:':
                    for (const i of $('.info-value', obj).toArray()) { au_ar_txt.push($(i).text()) }
                    author = au_ar_txt.join(',');
                    artist = au_ar_txt.join(',');
                    break
                case 'Thể loại:':
                    $('.info-value > a', obj).each((_: any, obj: any) => {
                        const label = $('span', obj).text().trim();
                        const id = $(obj).attr('href') ?? label;
                        tags.push(App.createTag({ label, id }));
                    });
                    break;
                case 'Tình trạng:':
                    status = $('.info-value > a', obj).text()
                    break;
                default:
                    break
            };
        });

        let image = $('.series-cover > div > .content').css('background-image');
        image = image.replace('url(', '').replace(')', '').replace(/\"/gi, "").replace(/['"]+/g, '');
        image = image.indexOf('https') === -1 ? image.replace('http', 'https') : image
        const titles = [this.decodeHTMLEntity($('.series-name > a').text().trim())];
        const desc = $('.series-summary > .summary-content').text();
        const rating = parseFloat(String($('div:nth-child(2) > .statistic-value').text().trim().split(' /')[0]))

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
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

        $('.list-chapters.at-series > a').each((_: any, obj: any) => {
            const id = String($(obj).first().attr('href')?.split('/').slice(-2).join('/'));
            const name = this.decodeHTMLEntity($('li > .chapter-name', obj).text());
            const [D, M, Y] = $('li > .chapter-time', obj).text().trim().split('/');
            const time = new Date([M, D, Y].join('/'));
            const chapNum = parseFloat(String($('li > .chapter-name', obj).text().trim().split(' ')[1]));

            chapters.push(App.createChapter({
                id,
                chapNum,
                name,
                langCode: '🇻🇳',
                time
            }));
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('#chapter-content > img').each((_: any, obj: any) => {
            if (!obj.attribs['data-src']) return;
            let link = obj.attribs['data-src'];
            pages.push(encodeURI(link));
        });

        return pages
    }

    parseSearchResults($: CheerioStatic): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('.container > div > div > div:nth-child(2) > div > div.row > .thumb-item-flow').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('.series-title > a', obj).text().trim());
            const mangaId = $('.series-title > a', obj).attr('href')?.split("/").pop() ?? title;
            let image = $('.a6-ratio > div.img-in-ratio', obj).attr('data-bg');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            image = image.indexOf('https') === -1 ? image.replace('http', 'https') : image
            const subtitle = $(`.thumb-detail > div > a`, obj).text().trim()
            if (!mangaId || !title) return;

            tiles.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return tiles
    }

    parseHotSection($: CheerioStatic): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('.owl-stage > .owl-item:not(.cloned)').each((_: any, obj: any) => {
            const title = this.decodeHTMLEntity($('.series-title > a', obj).text().trim());
            const mangaId = $('.series-title > a', obj).attr('href')?.split("/").pop() ?? title;
            let image = $('.a6-ratio > div.img-in-ratio', obj).css('background-image').replace('url(', '').replace(')', '').replace(/\"/gi, "").replace(/['"]+/g, '');
            image = !image ? "https://i.imgur.com/GYUxEX8.png" : image;
            image = image.indexOf('https') === -1 ? image.replace('http', 'https') : image
            const subtitle = $(`.thumb-detail > div > a`, obj).text().trim()
            if (!mangaId || !title) return;

            tiles.push(App.createPartialSourceManga({
                mangaId,
                image,
                title,
                subtitle
            }));
        });

        return tiles
    }

    parseTags($: any): TagSection[] {
        const arrayTags: Tag[] = [];
        const arrayTags2: Tag[] = [
            {
                label: 'Tất cả',
                id: 'status.'
            },
            {
                label: 'Đang tiến hành',
                id: 'status.1'
            },
            {
                label: 'Tạm ngưng',
                id: 'status.2'
            },
            {
                label: 'Hoàn thành',
                id: 'status.3'
            }
        ];
        const arrayTags3: Tag[] = [];
        //the loai
        for (const tag of $('div.search-gerne_item', 'div.form-group').toArray()) {
            const label = $('.gerne-name', tag).text().trim();
            const id = $('label', tag).attr('data-genre-id') ?? label;
            if (!id || !label) continue;
            arrayTags.push({ id: id, label: label });
        }
        //sap xep
        for (const tag of $('option', 'select#list-sort').toArray()) {
            const label = $(tag).text().trim();
            const id = 'sort.' + $(tag).attr('value') ?? label;
            if (!id || !label) continue;
            arrayTags3.push({ id: id, label: label });
        }

        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể loại', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Tình trạng', tags: arrayTags2.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Sắp xếp', tags: arrayTags3.map(x => App.createTag(x)) }),
        ]
        return tagSections;
    }

    private decodeHTMLEntity(str: string): string {
        return entities.decodeHTML(str)
    }
}