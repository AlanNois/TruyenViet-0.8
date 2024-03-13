import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    MangaUpdates,
    PartialSourceManga
} from '@paperback/types'

export class Parser {

    protected convertTime(timeAgo: string): Date {
        let trimmed = Number((/\d*/.exec(timeAgo) ?? [])[0]);
        trimmed = (trimmed === 0 && timeAgo.includes('a')) ? 1 : trimmed;

        if (timeAgo.includes('giây') || timeAgo.includes('secs')) {
            return new Date(Date.now() - trimmed * 1000);
        } else if (timeAgo.includes('phút')) {
            return new Date(Date.now() - trimmed * 60000);
        } else if (timeAgo.includes('giờ')) {
            return new Date(Date.now() - trimmed * 3600000);
        } else if (timeAgo.includes('ngày')) {
            return new Date(Date.now() - trimmed * 86400000);
        } else if (timeAgo.includes('tuần')) {
            return new Date(Date.now() - trimmed * 604800000);
        } else if (timeAgo.includes('tháng')) {
            return new Date(Date.now() - trimmed * 2592000000);
        } else if (timeAgo.includes('năm')) {
            return new Date(Date.now() - trimmed * 31556952000);
        } else if (timeAgo.includes(':')) {
            const [H, D] = timeAgo.split(' ');
            const fixD = String(D).split('/');
            const finalD = `${fixD[1]}/${fixD[0]}/${new Date().getFullYear()}`;
            return new Date(`${finalD} ${H}`);
        } else {
            const split = timeAgo.split('/');
            return new Date(`${split[1]}/${split[0]}/20${split[2]}`);
        }
    }

    parseMangaDetails($: CheerioStatic, mangaId: string, DOMAIN: string): SourceManga {
        const tags: Tag[] = [];

        $('li.kind > p.col-xs-8 > a').each((_: any, obj: any) => {
            const label = $(obj).text();
            const id = $(obj).attr('href')?.split('/')[4] ?? label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = $('h1.title-detail').text()
        const author = $('ul.list-info > li.author > p.col-xs-8').text();
        const artist = $('ul.list-info > li.author > p.col-xs-8').text();
        const image = $('div.col-image > img').attr('src');
        const desc = $('div.detail-content > p').text();
        const status = $('li.status > p.col-xs-8').text()
        const rating = parseFloat($('span[itemprop="ratingValue"]').text());

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles: [titles],
                author,
                artist,
                desc,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                status,
                rating,
                tags: [App.createTagSection({ label: 'genres', tags, id: '0' })],
            })
        });
    }


    parseChapterList($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];

        $('div.list-chapter > nav > ul > li:not(:first-child).row:not(.heading)').each((_: any, obj: any) => {
            const id = String($('div.chapter a', obj).attr('href'))
            const time = $('div.col-xs-4', obj).text();
            const group = $('div.col-xs-2', obj).text();
            let name = $('div.chapter a', obj).text();
            const chapNum = parseFloat(String($('div.chapter a', obj).text().split(' ')[1]));
            name = name.includes(':') ? String(name.split('Chapter ' + chapNum + ':')[1]).trim() : '';
            const timeFinal = this.convertTime(time);

            chapters.push(App.createChapter({
                id,
                chapNum,
                name,
                langCode: '🇻🇳',
                time: timeFinal,
                group: `${group} lượt xem`
            }));
        });

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('div.reading-detail > div.page-chapter > img').each((_: any, obj: any) => {
            if (!obj.attribs['data-original']) return;
            const link = obj.attribs['data-original'];
            pages.push(!link ? "https://i.imgur.com/GYUxEX8.png" : link);
        });

        return pages;
    }

    parseSearchResults($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('div.item', 'div.row').each((_: any, manga: any) => {
            const title = $('figure.clearfix > figcaption > h3 > a', manga).first().text().trim();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();
            if (!mangaId || !title) return;

            console.log(title, mangaId, image, subtitle)

            tiles.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle,
            }));
        });

        return tiles;
    }

    parseTags($: CheerioStatic): TagSection[] {
        //id tag đéo đc trùng nhau
        const arrayTags: Tag[] = [];
        const arrayTags2: Tag[] = [];
        const arrayTags3: Tag[] = [];
        const arrayTags4: Tag[] = [];
        const arrayTags5: Tag[] = [];

        //The loai
        for (const tag of $('div.col-md-3.col-sm-4.col-xs-6.mrb10', 'div.col-sm-10 > div.row').toArray()) {
            const label = $('div.genre-item', tag).text().trim();
            const id = $('div.genre-item > span', tag).attr('data-id') ?? label;
            if (!id || !label) continue;
            arrayTags.push({ id: id, label: label });
        }
        //Số lượng chapter
        for (const tag of $('option', 'select.select-minchapter').toArray()) {
            const label = $(tag).text().trim();
            const id = 'minchapter.' + $(tag).attr('value') ?? label;
            if (!id || !label) continue;
            arrayTags2.push({ id: id, label: label });
        }
        //Tình trạng
        for (const tag of $('option', '.select-status').toArray()) {
            const label = $(tag).text().trim();
            const id = 'status.' + $(tag).attr('value') ?? label;
            if (!id || !label) continue;
            arrayTags3.push({ id: id, label: label });
        }
        //Dành cho
        for (const tag of $('option', '.select-gender').toArray()) {
            const label = $(tag).text().trim();
            const id = 'gender.' + $(tag).attr('value') ?? label;
            if (!id || !label) continue;
            arrayTags4.push({ id: id, label: label });
        }
        //Sắp xếp theo
        for (const tag of $('option', '.select-sort').toArray()) {
            const label = $(tag).text().trim();
            const id = 'sort.' + $(tag).attr('value') ?? label;
            if (!id || !label) continue;
            arrayTags5.push({ id: id, label: label });
        }
        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể Loại (Có thể chọn nhiều hơn 1)', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Số Lượng Chapter (Chỉ chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Tình Trạng (Chỉ chọn 1)', tags: arrayTags3.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '3', label: 'Dành Cho (Chỉ chọn 1)', tags: arrayTags4.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '4', label: 'Sắp xếp theo (Chỉ chọn 1)', tags: arrayTags5.map(x => App.createTag(x)) }),
        ];
        return tagSections;
    }

    parseFeaturedSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const featuredItems: PartialSourceManga[] = [];

        $('div.item', 'div.altcontent1').each((_: any, manga: any) => {
            const title = $('.slide-caption > h3 > a', manga).text();
            const mangaId = $('a', manga).attr('href')?.split('/').pop();
            const image = $('a > img.lazyOwl', manga).attr('src');
            const subtitle = $('.slide-caption > a', manga).text().trim() + ' - ' + $('.slide-caption > .time', manga).text().trim();
            if (!mangaId || !title) return;
            featuredItems.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle,
            }));
        });

        return featuredItems;
    }

    parsePopularSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const viewestItems: PartialSourceManga[] = [];

        $('div.item', 'div.row').slice(0, 20).each((_: any, manga: any) => {
            const title = $('figure > figcaption > h3 > a', manga).text().trim();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();
            if (!mangaId || !title) return;
            viewestItems.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle
            }));
        });

        return viewestItems;
    }

    parseHotSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const topWeek: PartialSourceManga[] = [];

        $('div.item', 'div.row').slice(0, 20).each((_: any, manga: any) => {
            const title = $('figure.clearfix > figcaption > h3 > a', manga).first().text();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();
            if (!mangaId || !title) return;
            topWeek.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle
            }));
        });

        return topWeek;
    }

    parseNewUpdatedSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const newUpdatedItems: PartialSourceManga[] = [];

        $('div.item', 'div.row').slice(0, 20).each((_: any, manga: any) => {
            const title = $('figure.clearfix > figcaption > h3 > a', manga).first().text();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();
            if (!mangaId || !title) return;
            newUpdatedItems.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle
            }));
        });

        return newUpdatedItems;
    }

    parseNewAddedSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const newAddedItems: PartialSourceManga[] = [];

        $('div.item', 'div.row').slice(0, 20).each((_: any, manga: any) => {
            const title = $('figure > figcaption > h3 > a', manga).text().trim();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();
            if (!mangaId || !title) return;
            newAddedItems.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle,
            }));
        });

        return newAddedItems;
    }

    parseFullSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const fullItems: PartialSourceManga[] = [];

        $('div.item', 'div.row').slice(0, 20).each((_: any, manga: any) => {
            const title = $('figure > figcaption > h3 > a', manga).text().trim();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();
            if (!mangaId || !title) return;
            fullItems.push(App.createPartialSourceManga({
                mangaId,
                image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                title,
                subtitle,
            }));
        });

        return fullItems;
    }


    parseViewMoreItems($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
        const mangas: PartialSourceManga[] = [];
        const collectedIds: Set<string> = new Set();

        $('div.item', 'div.row').each((_: any, manga: any) => {
            const title = $('figure > figcaption > h3 > a', manga).text().trim();
            const mangaId = $('figure.clearfix > div.image > a', manga).attr('href')?.split('/').pop();
            const image = $('figure.clearfix > div.image > a > img', manga).first().attr('data-original');
            const subtitle = $("figure.clearfix > figcaption > ul > li.chapter:nth-of-type(1) > a", manga).last().text().trim();

            if (!mangaId || !title) return;
            if (!collectedIds.has(mangaId)) {
                mangas.push(App.createPartialSourceManga({
                    mangaId,
                    image: !image ? "https://i.imgur.com/GYUxEX8.png" : image.includes('http') ? image : `${DOMAIN}${image}`,
                    title,
                    subtitle,
                }));
                collectedIds.add(mangaId);
            }
        });

        return mangas;
    }

    parseUpdatedManga(updateManga: any, time: Date, ids: string[]): MangaUpdates {
        const returnObject: MangaUpdates = {
            ids: []
        };

        for (const elem of updateManga) {
            if (ids.includes(elem.id) && time < this.convertTime(elem.time)) {
                returnObject.ids.push(elem.id);
            }
        }

        return returnObject;
    }

}