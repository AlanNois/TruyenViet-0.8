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
        } else if (timeAgo.includes('tuần')) {
            return new Date(Date.now() - trimmed * 604800000);
        } else if (timeAgo.includes('năm')) {
            return new Date(Date.now() - trimmed * 31556952000);
        } else if (timeAgo.includes(':')) {
            const [H, D] = timeAgo.split(' ');
            const fixD = String(D).split('/');
            const finalD = `${fixD[1]}/${fixD[0]}/${new Date().getFullYear()}`;
            return new Date(`${finalD} ${H}`);
        } else if (timeAgo.includes('-')) {
            const [day, month, year] = timeAgo.split('-');
            return new Date(`${month}/${day}/${year}`);
        } else {
            const split = timeAgo.split('/');
            return new Date(`${split[1]}/${split[0]}/20${split[2]}`);
        }
    }

    parseMangaDetails($: CheerioStatic, mangaId: string): SourceManga {
        const tags: Tag[] = [];

        $('li.category > p.col-sm-8 > a').each((_: any, obj: any) => {
            const label = $(obj).text();
            const id = $(obj).attr('href')?.split('/').pop() ?? label;
            tags.push(App.createTag({ label, id }));
        });

        const titles = $('h1.title-manga').text().trim();
        const author = $('ul.info-detail-comic > li.author > p.col-sm-8').text();
        const artist = $('ul.info-detail-comic > li.author > p.col-sm-8').text();
        const image = $('div.image-info > img').attr('src') || '';
        const desc = $('div.summary-content > p').text();
        const status = $('ul.info-detail-comic > li.status > p.col-sm-8').text();
        const rating = parseFloat($('span[itemprop="ratingValue"]').text());

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
            }),
        });
    }

    parseChapterList($: CheerioStatic): Chapter[] {
        const chapters: Chapter[] = [];

        $('div.list-chapter > nav > ul > li.row').not('li[style="display: none"]').each((_: any, obj: any) => {
            const id = String($('div.chapters a', obj).attr('href')).split('/truyen-tranh/').pop() || '';
            const time = $('div.col-4', obj).text().trim();
            const group = $('div.col-3', obj).text().trim();
            let name = $('div.chapters a', obj).text();
            const chapNum = $('div.chapters a', obj).text().split(' ')[1];
            name = name.includes(':') ? String(name.split(':')[1]).trim() : '';
            const timeFinal = this.convertTime(time);

            chapters.push(App.createChapter({
                id: id,
                chapNum: parseFloat(String(chapNum)),
                name: name,
                langCode: '🇻🇳',
                time: timeFinal,
                group: `${group} lượt xem`
            }));
        });

        if (chapters.length == 0) {
            throw new Error('No chapters found');
        }

        console.log(chapters);

        return chapters;
    }

    parseChapterDetails($: CheerioStatic): string[] {
        const pages: string[] = [];

        $('div.list-image-detail > div.page-chapter > img').each((_: any, obj: any) => {
            if (!obj) return;
            const link = !obj.attribs['data-original'] 
                ? obj.attribs['src'] 
                : obj.attribs['data-original'];
            pages.push(link.indexOf('https') === -1 ? 'https:' + link : link);
        });

        return pages;
    }

    parseTags($: any): TagSection[] {
        //id tag đéo đc trùng nhau
        const arrayTags: Tag[] = [];
        // const arrayTags2: Tag[] = [];
        // const arrayTags3: Tag[] = [];
        // const arrayTags4: Tag[] = [];
        // const arrayTags5: Tag[] = [];

        //The loai
        for (const element of $('.categories-detail ul.nav li:not(.active) a').toArray()) {
            const label = $(element).text().trim();

            const href = $(element).attr('href');

            if (!label || !href) continue;

            const id = href.split('/').filter(Boolean).pop() ?? href;

            arrayTags.push({ id: id, label: label });
        }
        // //Số lượng chapter
        // for (const tag of $('option', 'select.select-minchapter').toArray()) {
        //     const label = $(tag).text().trim();
        //     const id = 'minchapter.' + ($(tag).attr('value') ?? label);
        //     if (!id || !label) continue;
        //     arrayTags2.push({ id: id, label: label });
        // }
        // //Tình trạng
        // for (const tag of $('option', '.select-status').toArray()) {
        //     const label = $(tag).text().trim();
        //     const id = 'status.' + ($(tag).attr('value') ?? label);
        //     if (!id || !label) continue;
        //     arrayTags3.push({ id: id, label: label });
        // }
        // //Dành cho
        // for (const tag of $('option', '.select-gender').toArray()) {
        //     const label = $(tag).text().trim();
        //     const id = 'gender.' + ($(tag).attr('value') ?? label);
        //     if (!id || !label) continue;
        //     arrayTags4.push({ id: id, label: label });
        // }
        // //Sắp xếp theo
        // for (const tag of $('option', '.select-sort').toArray()) {
        //     const label = $(tag).text().trim();
        //     const id = 'sort.' + ($(tag).attr('value') ?? label);
        //     if (!id || !label) continue;
        //     arrayTags5.push({ id: id, label: label });
        // }
        const tagSections: TagSection[] = [
            App.createTagSection({ id: '0', label: 'Thể Loại (Có thể chọn nhiều hơn 1)', tags: arrayTags.map(x => App.createTag(x)) }),
            // App.createTagSection({ id: '1', label: 'Số Lượng Chapter (Chỉ chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
            // App.createTagSection({ id: '2', label: 'Tình Trạng (Chỉ chọn 1)', tags: arrayTags3.map(x => App.createTag(x)) }),
            // App.createTagSection({ id: '3', label: 'Dành Cho (Chỉ chọn 1)', tags: arrayTags4.map(x => App.createTag(x)) }),
            // App.createTagSection({ id: '4', label: 'Sắp xếp theo (Chỉ chọn 1)', tags: arrayTags5.map(x => App.createTag(x)) }),
        ];
        return tagSections;
    }

    parseFeaturedSection($: CheerioStatic): PartialSourceManga[] {
        const featuredItems: PartialSourceManga[] = [];

        $('div.slide-item', 'div.slide-show').each((_: any, manga: any) => {
            const title = $('.slide-info > h3 > a', manga).text();
            const id = $('a', manga).attr('href')?.split('/truyen-tranh/').pop();
            const image = $('a > img.owl-lazy', manga).attr('data-src');
            const subtitle = $('.detail-slide > a', manga).text().trim() + ' - ' + $('.slide-info > .slide-time', manga).text().trim();
            if (!id || !title) return;
            featuredItems.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: !image ? 'https://i.imgur.com/GYUxEX8.png' : image,
                title: title,
                subtitle: subtitle,
            }));
        });

        return featuredItems;
    }

    parseSection($: CheerioStatic): PartialSourceManga[] {
        const sectionItems: PartialSourceManga[] = [];

        $('div.item', 'div.row').each((_: any, manga: any) => {
            const title = $('.clearfix > .caption > h3 > a', manga).first().text();
            const id = $('.clearfix > div.image-item > a', manga).attr('href')?.split('/truyen-tranh/').pop();
            const image = $('.clearfix > div.image-item > a > img', manga).first().attr('src')?.includes('image_default.png') 
                ? $('.clearfix > div.image-item > a > img', manga).first().attr('data-original') 
                : $('.clearfix > div.image-item > a > img', manga).first().attr('src');
            const subtitle = $('.clearfix > .caption > ul > li.chapter-detail:nth-of-type(1) > a', manga).last().text().trim();
            if (!id || !title) return;
            sectionItems.push(App.createPartialSourceManga({
                mangaId: String(id),
                image: !image ? 'https://i.imgur.com/GYUxEX8.png' : image,
                title: title,
                subtitle: subtitle,
            }));
        });

        return sectionItems;
    }
}