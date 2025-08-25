// import {
//     Chapter,
//     SourceManga,
//     Tag,
//     TagSection,
//     PartialSourceManga
// } from '@paperback/types'
// const entities = require("entities"); //Import package for decoding HTML entities


// export class Parser {

//     /* The above code is defining a private method called `decodeHTMLEntity` in a TypeScript class.
//     This method takes a string as input and returns a decoded version of the string where HTML
//     entities have been replaced with their corresponding characters. The decoding is done using the
//     `entities.decodeHTML` function. */
//     private decodeHTMLEntity = (str: string): string => {
//         return entities.decodeHTML(str);
//     }

//     /**
//      * The function `parseMangaDetails` takes in a CheerioStatic object and a mangaId string, and
//      * parses the manga details from the object to create and return a SourceManga object.
//      * @param {CheerioStatic} $ - The CheerioStatic parameter is a reference to the Cheerio library,
//      * which is used for parsing HTML.
//      * @param {string} mangaId - The mangaId parameter is a string that represents the unique
//      * identifier of a manga. It is used to fetch the details of a specific manga from a source.
//      * @returns a SourceManga object.
//      */
//     parseMangaDetails($: CheerioStatic, mangaId: string, DOMAIN: string): SourceManga {
//         const tags: Tag[] = [];

//         let author = '';
//         let artist = '';

//         $('.post-content > .post-content_item').each((_: any, obj: any) => {
//             switch ($('.summary-heading', obj).text().trim()) {
//                 case "Tác giả":
//                     author = $('.summary-content', obj).text().trim();
//                     break;
//                 case "Hoạ sỹ":
//                     artist = $('.summary-content', obj).text().trim();
//                     break;
//                 case "Thể loại":
//                     $('.summary-content > .genres-content > a').each((_: any, tag: any) => {
//                         const label = $(tag).text().trim();
//                         const id = $(obj).attr('href')?.split('/').pop() ?? label
//                         tags.push(App.createTag({ label, id }))
//                     });
//                     break;
//             }
//         })

//         const titles = $('.post-title > h1').text().trim();
//         const image = `${DOMAIN}${$('.summary_image > a > img').attr('src')}`;
//         const desc = this.decodeHTMLEntity($('.dsct > p').text());
//         const status = $('.post-status > div:nth-child(2) > div.summary-content').text().trim();
//         const rating = parseFloat($('span[property="ratingValue"]').text().trim())

//         return App.createSourceManga({
//             id: mangaId,
//             mangaInfo: App.createMangaInfo({
//                 titles: [titles],
//                 author,
//                 artist,
//                 image,
//                 desc,
//                 status,
//                 tags: [App.createTagSection({ id: '0', label: 'genres', tags })],
//                 rating: Number.isNaN(rating) ? 0 : rating
//             }),
//         })
//     }

//     /**
//      * The function `parseChapterList` takes a CheerioStatic object and returns an array of Chapter
//      * objects by extracting data from the HTML structure.
//      * @param {CheerioStatic} $ - The parameter `$` is a reference to the CheerioStatic object, which
//      * is a jQuery-like library for parsing HTML. It is used to select and manipulate elements in the
//      * HTML document.
//      * @returns an array of Chapter objects.
//      */
//     parseChapterList($: CheerioStatic): Chapter[] {
//         const chapters: Chapter[] = [];

//         $('.row-content-chapter > li').each((_: any, obj: any) => {
//             const id = String($('a', obj).attr('href')?.split('/').slice(4).join('/'));
//             const view_n_time = $('span', obj).text().trim().split('-');
//             const time = new Date(String(view_n_time[1]));
//             const group = view_n_time[0];
//             const name = $('a', obj).text();
//             const chapNum = $('a', obj).text().split(' ')[1];

//             /* The code `chapters.push(App.createChapter({ id, chapNum: parseFloat(String(chapNum)),
//             name, langCode: '🇻🇳', time, group }))` is creating a new Chapter object and pushing it
//             into the `chapters` array. */
//             chapters.push(App.createChapter({
//                 id,
//                 chapNum: parseFloat(String(chapNum)),
//                 name,
//                 langCode: '🇻🇳',
//                 time,
//                 group
//             }))
//         })

//         if (chapters.length == 0) {
//             throw new Error('No chapter found')
//         }

//         return chapters
//     }

//     /**
//      * The function "parseChapterDetails" takes a CheerioStatic object as input, iterates over a
//      * collection of image elements, extracts the "data-src" attribute value from each element, and
//      * returns an array of these values.
//      * @param {CheerioStatic} $ - CheerioStatic - This is a reference to the Cheerio library, which is
//      * used for parsing and manipulating HTML.
//      * @returns The function `parseChapterDetails` returns an array of strings, which represents the
//      * links to the pages of a chapter.
//      */
//     parseChapterDetails($: CheerioStatic): string[] {
//         const pages: string[] = [];

//         $('.image-placeholder > img').each((_: any, obj: any) => {
//             if (!obj.attribs['data-src']) return;
//             const link = obj.attribs['data-src'];
//             pages.push(link);
//         });

//         return pages
//     }

//     /**
//      * The function parses search results from a website and returns an array of partial manga objects.
//      * @param {CheerioStatic} $ - CheerioStatic - A reference to the Cheerio library, which is used for
//      * parsing HTML.
//      * @returns an array of objects of type PartialSourceManga.
//      */
//     parseSearchResults($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
//         const tiles: PartialSourceManga[] = [];

//         $('.page-item', '.listupd').each((_: any, manga: any) => {
//             const title = $('div > div > h3', manga).text().trim();
//             const id = $('div > div > h3 > a', manga).attr('href')?.split('/').slice(4).join('/');
//             let image = `${DOMAIN}${$('div > div > a > img', manga).first().attr('data-src')}`;
//             image = !image ? "https://i.imgur.com/GYUxEX8.png" : image
//             const subtitle = $("div > div > .list-chapter > div:nth-of-type(1) > span", manga).text().trim();
//             if (!id || !title) return;

//             tiles.push(App.createPartialSourceManga({
//                 mangaId: String(id),
//                 image: String(image),
//                 title: title,
//                 subtitle: subtitle,
//             }));
//         });

//         return tiles
//     }

//     parseFeaturedSection($: CheerioStatic, DOMAIN: string): PartialSourceManga[] {
//         const featuredItems: PartialSourceManga[] = [];

//         $('div', '.owl-wrapper').each((_: any, manga: any) => {
//             const title = $('.item > .slide-caption > h3', manga).text().trim();
//             const id = $('.item > .slide-caption > h3 > a', manga).attr('href')?.split('/').slice(4).join('/');
//             let image = `${DOMAIN}${$('.item > a > img', manga).first().attr('data-src')}`;
//             image = !image ? "https://i.imgur.com/GYUxEX8.png" : image
//             const subtitle = String($(".item > .slide-caption", manga).text().trim().split('\n')[1]?.trim());
//             if (!id || !title) return;

//             featuredItems.push(App.createPartialSourceManga({
//                 mangaId: String(id),
//                 image: String(image),
//                 title: title,
//                 subtitle: subtitle,
//             }));
//         });
//         console.log(featuredItems)

//         return featuredItems
//     }

//     parseTags(): TagSection[] {
//         const arrayTags: Tag[] = [
//             { id: "yuri", label: "Yuri" },
//             { id: "yaoi", label: "Yaoi" },
//             { id: "xuyen-sach", label: "Xuyên Sách" },
//             { id: "xuyen-nhanh", label: "Xuyên Nhanh" },
//             { id: "xuyen-khong", label: "Xuyên Không" },
//             { id: "webtoons", label: "Webtoons" },
//             { id: "webtoon", label: "Webtoon" },
//             { id: "vuong-gia", label: "Vương Gia" },
//             { id: "vuon-truong", label: "Vườn Trường" },
//             { id: "vo-thuat", label: "Võ Thuật" },
//             { id: "vo-hiep", label: "Võ Hiệp" },
//             { id: "vien-tuong", label: "Viễn Tưởng" },
//             { id: "tu-tien", label: "Tu Tiên" },
//             { id: "tu-luyen", label: "Tu Luyện" },
//             { id: "truyen-tranh", label: "Truyện Tranh" },
//             { id: "truyen-nhat-manga", label: "Truyện Nhật (Manga)" },
//             { id: "truyen-nam", label: "Truyện Nam" },
//             { id: "truyen-mau", label: "Truyện Màu" },
//             { id: "truyen-ma", label: "Truyện Ma" },
//             { id: "trung-sinh", label: "Trùng Sinh" },
//             { id: "trong-sinh", label: "Trọng Sinh" },
//             { id: "trinh-tham", label: "Trinh Thám" },
//             { id: "tragedy", label: "Tragedy" },
//             { id: "tra-thu", label: "Trả Thù" },
//             { id: "tong-tai", label: "Tổng Tài" },
//             { id: "tinh-yeu", label: "Tình Yêu" },
//             { id: "tinh-cam", label: "Tình Cảm" },
//             { id: "thuan-phuc-thu", label: "Thuần Phục Thú" },
//             { id: "thieu-nhi", label: "Thiếu Nhi" },
//             { id: "thien-tai", label: "Thiên Tài" },
//             { id: "the-thao", label: "Thể Thao" },
//             { id: "thanh-xuan-vuon-truong", label: "Thanh Xuân Vườn Trường" },
//             { id: "thanh-xuan", label: "Thanh Xuân" },
//             { id: "thai-giam", label: "Thái Giám" },
//             { id: "tap-chi-truyen-t", label: "Tạp Chí Truyện T" },
//             { id: "supernatural", label: "Supernatural" },
//             { id: "sung-vat", label: "Sủng Vật" },
//             { id: "sung", label: "Sủng" },
//             { id: "sports", label: "Sports" },
//             { id: "soft-yuri", label: "Soft Yuri" },
//             { id: "smut", label: "Smut" },
//             { id: "slice-of-life", label: "Slice of life" },
//             { id: "sieu-nhien", label: "Siêu Nhiên" },
//             { id: "showbiz", label: "Showbiz" },
//             { id: "shounen-ai", label: "Shounen Ai" },
//             { id: "shounen", label: "Shounen" },
//             { id: "shoujo-ai", label: "Shoujo Ai" },
//             { id: "shoujo", label: "Shoujo" },
//             { id: "series", label: "Series" },
//             { id: "seinen", label: "Seinen" },
//             { id: "sci-fi", label: "Sci-Fi" },
//             { id: "school-life", label: "School Life" },
//             { id: "sang-van", label: "Sảng Văn" },
//             { id: "san-ban", label: "Săn Bắn" },
//             { id: "romance", label: "Romance" },
//             { id: "quai-vat", label: "Quái Vật" },
//             { id: "psychological", label: "Psychological" },
//             { id: "phieu-luu", label: "Phiêu Lưu" },
//             { id: "phep-thuat", label: "Phép Thuật" },
//             { id: "phap-y", label: "Pháp Y" },
//             { id: "phan-dien", label: "Phản Diện" },
//             { id: "one-shot", label: "One Shot" },
//             { id: "nu-phu", label: "Nữ Phụ" },
//             { id: "nu-gia-nam", label: "Nữ Giả Nam" },
//             { id: "nu-cuong", label: "Nữ Cường" },
//             { id: "nhiet-huyet", label: "Nhiệt Huyết" },
//             { id: "nguoi-lon", label: "Người Lớn" },
//             { id: "nguoc", label: "Ngược" },
//             { id: "ngu-thu", label: "Ngự Thú" },
//             { id: "ngot-sung", label: "Ngọt Sủng" },
//             // { id: "ngon-tu-nhay-cam", label: "Ngôn Từ Nhạy Cảm" },
//             { id: "ngon-tinh", label: "Ngôn Tình" },
//             // { id: "ngon-t", label: "Ngôn T" },
//             { id: "net-dep", label: "Nét Đẹp" },
//             { id: "nau-an", label: "Nấu Ăn" },
//             { id: "mystery", label: "Mystery" },
//             { id: "murim", label: "Murim" },
//             { id: "mecha", label: "Mecha" },
//             { id: "mature", label: "Mature" },
//             { id: "mat-the", label: "Mạt Thế" },
//             { id: "martial-arts", label: "Martial Arts" },
//             { id: "mao-hiem", label: "Mạo Hiểm" },
//             { id: "manhwa", label: "Manhwa" },
//             // {
//             //     id: "manhua-ngon-tinh-thanh-xuan-vuon-truong",
//             //     label: "Manhua; Ngôn Tình; Thanh Xuân Vườn Trường"
//             // },
//             { id: "manhua", label: "Manhua" },
//             { id: "manga", label: "Manga" },
//             { id: "magic", label: "Magic" },
//             // { id: "magi", label: "Magi" },
//             { id: "luan-hoi", label: "Luân Hồi" },
//             { id: "live-action", label: "Live Action" },
//             { id: "linh-di", label: "Linh Dị" },
//             { id: "lich-su", label: "Lịch Sử" },
//             { id: "lgbt", label: "Lgbt+" },
//             { id: "leo-thap", label: "Leo Tháp" },
//             { id: "lang-man", label: "Lãng Mạn" },
//             { id: "ky-ao", label: "Kỳ Ảo" },
//             { id: "kinh-di", label: "Kinh Dị" },
//             { id: "kiem-hiep", label: "Kiếm Hiệp" },
//             { id: "kich-tinh", label: "Kịch Tính." },
//             { id: "khong-gian", label: "Không Gian" },
//             { id: "khong-che", label: "Không Che" },
//             { id: "khoa-hoc", label: "Khoa Học" },
//             { id: "josei", label: "Josei" },
//             { id: "isekai", label: "Isekai" },
//             { id: "huyen-huyen", label: "Huyền Huyễn" },
//             { id: "huyen-bi", label: "Huyền Bí" },
//             { id: "horror", label: "Horror" },
//             { id: "hoc-duong", label: "Học Đường" },
//             { id: "hoang-cung", label: "Hoàng Cung" },
//             { id: "historical", label: "Historical" },
//             { id: "hien-dai", label: "Hiện Đại" },
//             { id: "hentaiz", label: "Hentaiz" },
//             { id: "hentai", label: "Hentai" },
//             { id: "he-thong", label: "Hệ thống" },
//             { id: "hau-cung", label: "Hậu Cung" },
//             { id: "harem", label: "Harem" },
//             // { id: "hao-mon-the-gia", label: "Hào Môn Thế Gia" },
//             { id: "hanh-dong", label: "Hành Động" },
//             { id: "hanh", label: "Hành" },
//             { id: "ham-nguc", label: "Hầm Ngục" },
//             { id: "hai-huoc", label: "Hài Hước." },
//             { id: "hai-huoc", label: "Hài Hước" },
//             { id: "h", label: "H" },
//             { id: "gioi-giai-tri", label: "Giới Giải Trí" },
//             { id: "gender-bender", label: "Gender Bender" },
//             { id: "game", label: "Game" },
//             { id: "full-color", label: "Full Color" },
//             { id: "fantasy", label: "Fantasy" },
//             { id: "ep-hon", label: "Ép Hôn" },
//             { id: "em-gai-no", label: "Em Gái Nô" },
//             { id: "ecchi", label: "Ecchi" },
//             { id: "do-thi", label: "Đô Thị" },
//             { id: "dich-nu", label: "Đích Nữ" },
//             { id: "dao-si", label: "Đạo Sĩ" },
//             { id: "dam-my", label: "Đam Mỹ" },
//             { id: "dai-nu-chu", label: "Đại Nữ Chủ" },
//             { id: "dai-lao", label: "Đại Lão" },
//             // { id: "du-hanh-thoi-gian", label: "Du Hành Thời Gian" },
//             { id: "drama", label: "Drama" },
//             { id: "doujinshi", label: "Doujinshi" },
//             { id: "di-toc", label: "Dị Tộc" },
//             { id: "di-nang", label: "Dị Năng" },
//             { id: "di-gioi", label: "Dị Giới" },
//             { id: "detective", label: "Detective" },
//             // { id: "cuoi-truoc-yeu-sau", label: "Cưới Trước Yêu Sau" },
//             { id: "cung-dau", label: "Cung Đấu" },
//             { id: "cooking", label: "Cooking" },
//             { id: "comic", label: "Comic" },
//             { id: "comedy", label: "Comedy" },
//             { id: "co-trang", label: "Cổ Trang" },
//             { id: "co-dai", label: "Cổ Đại" },
//             { id: "co", label: "Cổ" },
//             { id: "chuyen-sinh", label: "Chuyển Sinh" },
//             { id: "boylove", label: "BoyLove" },
//             { id: "bi-kich", label: "Bi Kịch" },
//             { id: "benh-kieu", label: "Bệnh Kiều" },
//             { id: "beeng-net", label: "Beeng.net" },
//             { id: "bathutong", label: "Bathutong" },
//             { id: "bao-thu", label: "Báo Thù" },
//             { id: "bao-luc", label: "Bạo Lực" },
//             { id: "bach-hop", label: "Bách Hợp" },
//             { id: "ba-dao", label: "Bá Đạo" },
//             { id: "au-co", label: "Âu Cổ" },
//             { id: "anime", label: "Anime" },
//             { id: "adventure", label: "Adventure" },
//             // {
//             //     id: "adult-ecchi-fantasy-harem-manhua-truyen-mau-webtoon",
//             //     label: "Adult - Ecchi - Fantasy - Harem - Manhua - Truyện Màu - Webtoon"
//             // },
//             { id: "adult", label: "Adult" },
//             { id: "adaptation", label: "Adaptation" },
//             // {
//             //     id: "action-manhua-webtoon-truyen-mau-he-thong",
//             //     label: "Action   Manhua   Webtoon   Truyện Màu   Hệ Thống"
//             // },
//             { id: "action", label: "Action" },
//             { id: "18", label: "18+" },
//             { id: "16", label: "16+" }
//         ];
//         const arrayTags2: Tag[] = [
//             {
//                 id: 'sort.latest-updated',
//                 label: 'Mới cập nhật'
//             },
//             {
//                 id: 'sort.score',
//                 label: 'Điểm'
//             },
//             {
//                 id: 'sort.name-az',
//                 label: 'Tên A-Z'
//             },
//             {
//                 id: 'sort.release-date',
//                 label: 'Ngày Phát Hành'
//             },
//             {
//                 id: 'sort.most-viewd',
//                 label: 'Xem Nhiều'
//             }
//         ];

//         // console.log('huh?')

//         // $('.sub-menu > ul > li').each((_: any, tag: any) => {
//         //     const label = $('a', tag).text().trim();
//         //     const id = $('a', tag).attr('href').split('/').pop() ?? label;
//         //     if (!id || !label) return;
//         //     arrayTags.push({ id: id, label: label });
//         // })

//         const tagSections: TagSection[] = [
//             App.createTagSection({ id: '0', label: 'Thể Loại (Chọn 1)', tags: arrayTags.map(x => App.createTag(x)) }),
//             App.createTagSection({ id: '1', label: 'Sắp xếp theo (Chỉ chọn 1)', tags: arrayTags2.map(x => App.createTag(x)) }),
//         ];

//         return tagSections
//     }
// }