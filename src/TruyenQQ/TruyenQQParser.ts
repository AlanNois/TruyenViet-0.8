import {
    Chapter,
    SourceManga,
    Tag,
    TagSection,
    PartialSourceManga
} from '@paperback/types';

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
        } else if (timeAgo.includes('năm')) {
            return new Date(Date.now() - trimmed * 31556952000);
        } else if (timeAgo.includes(':')) {
            const [H, D] = timeAgo.split(' ');
            const fixD = String(D).split('/');
            const finalD = `${fixD[1]}/${fixD[0]}/${new Date().getFullYear()}`;
            return new Date(`${finalD} ${H}`);
        } else {
            const split = timeAgo.split('/');
            return new Date(`${split[1]}/${split[0]}/${split[2]}`);
        }
    }

    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        $('a', '.list01').each((_: any, obj: any) => {
            const label = $(obj).text().trim();
            const id = $(obj).attr('href')?.split('/')[4] ?? label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = [$('.book_other h1').text().trim()];
        const author = $('ul.list-info > li.author > p.col-xs-9').text();
        const artist = $('ul.list-info > li.author > p.col-xs-9').text();
        const image = $('.book_avatar > img').attr('src') ?? '';
        const desc = $('div.detail-content > p').text();
        const status = $('ul.list-info > li.status > p.col-xs-9').text();

        return App.createSourceManga({
            id: mangaId,
            mangaInfo: App.createMangaInfo({
                titles,
                author,
                artist,
                image,
                desc,
                status,
                tags: [App.createTagSection({ id: '0', label: 'genre', tags })]
            })
        });
    }

    parseChapterList($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];

        $('.works-chapter-list > .works-chapter-item').each((_: any, obj: any) => {
            const id = String($('.col-md-10.col-sm-10.col-xs-8 > a', obj).attr('href')?.split('/').pop());
            const time = $('.col-md-2.col-sm-2.col-xs-4', obj).text().trim();
            const name = $('.col-md-10.col-sm-10.col-xs-8 > a', obj).text();
            const chapNum = name.split(' ')[1];
            const timeFinal = this.convertTime(time);

            chapters.push(App.createChapter({
                id,
                chapNum: parseFloat(String(chapNum)),
                name,
                langCode: '🇻🇳',
                time: timeFinal
            }));
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('.chapter_content div .page-chapter img').each((_: any, obj: any) => {
            const src = obj.attribs['src'];
            const dataOriginal = obj.attribs['data-original'];
            const dataCdn = obj.attribs['data-cdn'];

            const urls = [src, dataOriginal, dataCdn];

            // Find the first URL that doesn't include the excluded domain
            const validUrl = urls.find(url => url);

            if (validUrl) {
                pages.push(validUrl);
            }
        });

        return pages;
    }

    parseSearchResults($: CheerioStatic): PartialSourceManga[] {
        const tiles: PartialSourceManga[] = [];

        $('.list_grid li').each((_: any, manga: any) => {
            const title = $('.book_name > h3 > a', manga).text().trim();
            const id = $('.book_name > h3 > a', manga).attr('href')?.split('/').pop();
            let image = $('.book_avatar > a > img', manga).attr('src') ?? '';
            image = !image ? 'https://i.imgur.com/GYUxEX8.png' : image;
            const subtitle = $('.last_chapter > a', manga).text().trim();

            tiles.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: String(image),
                title: title,
                subtitle: subtitle,
            }));
        });

        return tiles;
    }

    parseTags($: any): TagSection[] {
        //id tag đéo đc trùng nhau
        const arrayTags: Tag[] = [];
        const arrayTags2: Tag[] = [];
        const arrayTags3: Tag[] = [];
        const arrayTags4: Tag[] = [];
        const arrayTags5: Tag[] = [];

        //The loai
        for (const tag of $('div.genre-item').toArray()) {
            const label = $(tag).text().trim();
            const id = $('span', tag).attr('data-id') ?? label;
            if (!id || !label) continue;
            arrayTags.push({ id: id, label: label });
        }
        //Số lượng chapter
        for (const tag of $('option', 'select#minchapter').toArray()) {
            const label = $(tag).text().trim();
            const id = 'minchapter.' + ($(tag).attr('value') ?? label);
            if (!id || !label) continue;
            arrayTags2.push({ id: id, label: label });
        }
        //Tình trạng
        for (const tag of $('option', 'select#status').toArray()) {
            const label = $(tag).text().trim();
            const id = 'status.' + ($(tag).attr('value') ?? label);
            if (!id || !label) continue;
            arrayTags3.push({ id: id, label: label });
        }
        //Quốc gia
        for (const tag of $('option', 'select#country').toArray()) {
            const label = $(tag).text().trim();
            const id = 'country.' + ($(tag).attr('value') ?? label);
            if (!id || !label) continue;
            arrayTags4.push({ id: id, label: label });
        }
        //Sắp xếp theo
        for (const tag of $('option', 'select#sort').toArray()) {
            const label = $(tag).text().trim();
            const id = 'sort.' + ($(tag).attr('value') ?? label);
            if (!id || !label) continue;
            arrayTags5.push({ id: id, label: label });
        }
        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể Loại (Có thể chọn nhiều hơn 1)', tags: arrayTags.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '1', label: 'Số Lượng Chapter (Chỉ chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '2', label: 'Tình Trạng (Chỉ chọn 1)', tags: arrayTags3.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '3', label: 'Quốc gia (Chỉ chọn 1)', tags: arrayTags4.map(x => App.createTag(x)) }),
            App.createTagSection({ id: '4', label: 'Sắp xếp theo (Chỉ chọn 1)', tags: arrayTags5.map(x => App.createTag(x)) }),
        ];
        return tagSections;
    }

    parseFeaturedSection($: CheerioStatic): PartialSourceManga[] {
        const featuredItems: PartialSourceManga[] = [];

        $('#div_suggest .list_grid li').each((_: any, manga: any) => {
            const title = $('.book_name > h3 > a', manga).text().trim();
            const id = $('.book_name > h3 > a', manga).attr('href')?.split('/').pop();
            let image = $('.book_avatar > a > img', manga).attr('src') ?? '';
            image = !image ? 'https://i.imgur.com/GYUxEX8.png' : image;
            const subtitle = $('.last_chapter > a', manga).text().trim();

            featuredItems.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: String(image),
                title: title,
                subtitle: subtitle,
            }));
        });

        return featuredItems;
    }

}