import { get, set } from 'idb-keyval';

// وظيفة لتخزين ملفات JSON
async function cacheJsonData(key, url) {
  try {
    const cachedData = await get(key);
    if (cachedData) {
      // تحقق من التحديثات حتى لو موجود في الكاش
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        await set(key, data);
        console.log(`${key} updated in cache`);
        return data;
      }
      return cachedData;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch JSON');
    const data = await response.json();
    await set(key, data);
    console.log(`${key} cached`);
    return data;
  } catch (error) {
    console.error(`Error caching ${key}:`, error);
    return null;
  }
}

// وظيفة لتخزين ملفات وسائط فردية
async function cacheMedia(url) {
  try {
    const cache = await caches.open('media-files');
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    await cache.put(url, response.clone());
    console.log(`${url} cached`);
  } catch (error) {
    console.error(`Error caching media ${url}:`, error);
  }
}

// قائمة أسفار الكتاب المقدس
const bibleBooks = [
  { name: "تكوين", chapters: 50, audioPrefix: "01_Genesis" },
  { name: "خروج", chapters: 40, audioPrefix: "02_Exodus" },
  { name: "لاويين", chapters: 27, audioPrefix: "03_Leviticus" },
  { name: "عدد", chapters: 36, audioPrefix: "04_Numbers" },
  { name: "تثنية", chapters: 34, audioPrefix: "05_Deuteronomy" },
  { name: "يشوع", chapters: 24, audioPrefix: "06_Joshua" },
  { name: "قضاة", chapters: 21, audioPrefix: "07_Judges" },
  { name: "راعوث", chapters: 4, audioPrefix: "08_Ruth" },
  { name: "صموئيل الأول", chapters: 31, audioPrefix: "09_1Samuel" },
  { name: "صموئيل الثاني", chapters: 24, audioPrefix: "10_2Samuel" },
  { name: "ملوك الأول", chapters: 22, audioPrefix: "11_1Kings" },
  { name: "ملوك الثاني", chapters: 25, audioPrefix: "12_2Kings" },
  { name: "أخبار الأيام الأول", chapters: 29, audioPrefix: "13_1Chronicles" },
  { name: "أخبار الأيام الثاني", chapters: 36, audioPrefix: "14_2Chronicles" },
  { name: "عزرا", chapters: 10, audioPrefix: "15_Ezra" },
  { name: "نحميا", chapters: 13, audioPrefix: "16_Nehemiah" },
  { name: "أستير", chapters: 10, audioPrefix: "17_Esther" },
  { name: "أيوب", chapters: 42, audioPrefix: "18_Job" },
  { name: "مزامير", chapters: 150, audioPrefix: "19_Psalms" },
  { name: "أمثال", chapters: 31, audioPrefix: "20_Proverbs" },
  { name: "جامعة", chapters: 12, audioPrefix: "21_Ecclesiastes" },
  { name: "نشيد الأنشاد", chapters: 8, audioPrefix: "22_Canticles" },
  { name: "إشعياء", chapters: 66, audioPrefix: "23_Isaiah" },
  { name: "إرميا", chapters: 52, audioPrefix: "24_Jeremiah" },
  { name: "مراثي إرميا", chapters: 5, audioPrefix: "25_Lamentations" },
  { name: "حزقيال", chapters: 48, audioPrefix: "26_Ezekiel" },
  { name: "دانيال", chapters: 12, audioPrefix: "27_Daniel" },
  { name: "هوشع", chapters: 14, audioPrefix: "28_Hosea" },
  { name: "يوئيل", chapters: 3, audioPrefix: "29_Joel" },
  { name: "عاموس", chapters: 9, audioPrefix: "30_Amos" },
  { name: "عوبديا", chapters: 1, audioPrefix: "31_Obadiah" },
  { name: "يونان", chapters: 4, audioPrefix: "32_Jonah" },
  { name: "ميخا", chapters: 7, audioPrefix: "33_Micah" },
  { name: "ناحوم", chapters: 3, audioPrefix: "34_Nahum" },
  { name: "حبقوق", chapters: 3, audioPrefix: "35_Habakkuk" },
  { name: "صفنيا", chapters: 3, audioPrefix: "36_Zephaniah" },
  { name: "حجي", chapters: 2, audioPrefix: "37_Haggai" },
  { name: "زكريا", chapters: 14, audioPrefix: "38_Zechariah" },
  { name: "ملاخي", chapters: 4, audioPrefix: "39_Malachi" },
  { name: "متى", chapters: 28, audioPrefix: "40_Matthew" },
  { name: "مرقس", chapters: 16, audioPrefix: "41_Mark" },
  { name: "لوقا", chapters: 24, audioPrefix: "42_Luke" },
  { name: "يوحنا", chapters: 21, audioPrefix: "43_John" },
  { name: "أعمال الرسل", chapters: 28, audioPrefix: "44_Acts" },
  { name: "رومية", chapters: 16, audioPrefix: "45_Romans" },
  { name: "كورنثوس الأولى", chapters: 16, audioPrefix: "46_1Corinthians" },
  { name: "كورنثوس الثانية", chapters: 13, audioPrefix: "47_2Corinthians" },
  { name: "غلاطية", chapters: 6, audioPrefix: "48_Galatians" },
  { name: "أفسس", chapters: 6, audioPrefix: "49_Ephesians" },
  { name: "فيلبي", chapters: 4, audioPrefix: "50_Philippians" },
  { name: "كولوسي", chapters: 4, audioPrefix: "51_Colossians" },
  { name: "تسالونيكي الأولى", chapters: 5, audioPrefix: "52_1Thessalonians" },
  { name: "تسالونيكي الثانية", chapters: 3, audioPrefix: "53_2Thessalonians" },
  { name: "تيموثاوس الأولى", chapters: 6, audioPrefix: "54_1Timothy" },
  { name: "تيموثاوس الثانية", chapters: 4, audioPrefix: "55_2Timothy" },
  { name: "تيطس", chapters: 3, audioPrefix: "56_Titus" },
  { name: "فليمون", chapters: 1, audioPrefix: "57_Philemon" },
  { name: "العبرانيين", chapters: 13, audioPrefix: "58_Hebrews" },
  { name: "يعقوب", chapters: 5, audioPrefix: "59_James" },
  { name: "بطرس الأولى", chapters: 5, audioPrefix: "60_1Peter" },
  { name: "بطرس الثانية", chapters: 3, audioPrefix: "61_2Peter" },
  { name: "يوحنا الأولى", chapters: 5, audioPrefix: "62_1John" },
  { name: "يوحنا الثانية", chapters: 1, audioPrefix: "63_2John" },
  { name: "يوحنا الثالثة", chapters: 1, audioPrefix: "64_3John" },
  { name: "يهوذا", chapters: 1, audioPrefix: "65_Jude" },
  { name: "رؤيا يوحنا", chapters: 22, audioPrefix: "66_Revelation" },
];

// وظيفة لتخزين جميع ملفات الصوتيات والفيديوهات تلقائيًا
async function cacheAllMedia(audioBaseUrl, videoBaseUrl) {
  try {
    const cache = await caches.open('media-files');

    // 1. توليد روابط الصوتيات (Audio Bible)
    const audioUrls = [];
    bibleBooks.forEach((book) => {
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const paddedChapter =
          book.name === "مزامير"
            ? chapter.toString().padStart(3, "0")
            : chapter.toString().padStart(2, "0");
        const audioUrl = `${audioBaseUrl}/${book.audioPrefix}_${paddedChapter}.mp3`;
        audioUrls.push(audioUrl);
      }
    });

    // 2. توليد روابط الفيديوهات (Hymns)
    const hymnsData = await cacheJsonData('hymns', '/hymns.json');
    const videoUrls = hymnsData?.hymns
      ? hymnsData.hymns.map((hymn) => `${videoBaseUrl}/${hymn}`)
      : [];

    // 3. دمج الروابط
    const allMediaUrls = [...audioUrls, ...videoUrls];
    console.log(`Preparing to cache ${allMediaUrls.length} media files...`);

    // 4. تخزين الملفات على دفعات صغيرة
    const chunkSize = 10; // خزن 10 ملفات في المرة
    for (let i = 0; i < allMediaUrls.length; i += chunkSize) {
      const chunk = allMediaUrls.slice(i, i + chunkSize);
      await Promise.all(
        chunk.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'no-store' });
            if (!response.ok) throw new Error(`Failed to fetch ${url}`);
            await cache.put(url, response.clone());
            console.log(`${url} cached`);
          } catch (error) {
            console.error(`Failed to cache ${url}:`, error);
          }
        })
      );
    }

    console.log('All available media files cached successfully');
  } catch (error) {
    console.error('Error caching media files:', error);
  }
}

// وظيفة لتحديث ملفات الوسائط
async function updateMediaCache(audioBaseUrl, videoBaseUrl) {
  try {
    // 1. جلب قائمة الترانيم المحدثة
    const hymnsData = await cacheJsonData('hymns', '/hymns.json');
    const videoUrls = hymnsData?.hymns
      ? hymnsData.hymns.map((hymn) => `${videoBaseUrl}/${hymn}`)
      : [];

    // 2. جلب قائمة الصوتيات
    const audioUrls = [];
    bibleBooks.forEach((book) => {
      for (let chapter = 1; chapter <= book.chapters; chapter++) {
        const paddedChapter =
          book.name === "مزامير"
            ? chapter.toString().padStart(3, "0")
            : chapter.toString().padStart(2, "0");
        const audioUrl = `${audioBaseUrl}/${book.audioPrefix}_${paddedChapter}.mp3`;
        audioUrls.push(audioUrl);
      }
    });

    // 3. دمج الروابط
    const allMediaUrls = [...audioUrls, ...videoUrls];

    // 4. فتح الكاش
    const cache = await caches.open('media-files');

    // 5. تحقق من الملفات الموجودة في الكاش
    const cachedRequests = await cache.keys();
    const cachedUrls = cachedRequests.map((req) => req.url);

    // 6. إضافة الملفات الجديدة وتحديث القديمة
    await Promise.all(
      allMediaUrls.map(async (url) => {
        if (!cachedUrls.includes(url)) {
          await cacheMedia(url); // خزن الملف الجديد
        } else {
          // تحقق من التحديثات
          const response = await fetch(url, { cache: 'no-store' });
          if (response.ok) {
            await cache.put(url, response.clone());
            console.log(`${url} updated`);
          }
        }
      })
    );

    // 7. حذف الملفات القديمة غير الموجودة في القائمة الجديدة
    await Promise.all(
      cachedRequests.map(async (req) => {
        if (!allMediaUrls.includes(req.url)) {
          await cache.delete(req);
          console.log(`${req.url} deleted from cache`);
        }
      })
    );

    console.log('Media cache updated successfully');
  } catch (error) {
    console.error('Error updating media cache:', error);
  }
}

export { cacheJsonData, cacheMedia, cacheAllMedia, updateMediaCache };
