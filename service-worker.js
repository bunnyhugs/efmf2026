const cacheName = "music-festival-schedule-v1.5-efmf2025";
const filesToCache = [
    "./", // Add other URLs that need to be cached here
"./app.js",
"./utils.js",
"./fest-logo.png",
"./bandcamp.png",
"./android-menu.png",
"./android-install.png",
"./safari-share.png",
"./safari-add-to-home-screen.png",
"./apple_splash_1125.png",
"./apple_splash_1242.png",
"./apple_splash_1536.png",
"./apple_splash_1668.png",
"./apple_splash_2048.png",
"./apple_splash_640.png",
"./apple_splash_750.png",
"./artists.json",
"./favicon.png",
"./files.txt",
"./follow-on.png",
"./heard-hover.png",
"./heard.png",
"./icon_x120.png",
"./icon_x152.png",
"./icon_x167.png",
"./icon_x180.png",
"./icon_x57.png",
"./icon_x76.png",
"./index.html",
"./jquery-3.7.0.min.js",
"./jquery.dataTables.min.css",
"./jquery.dataTables.min.js",
"./locations.json",
"./manifest.json",
"./map.jpg",
"./map0.jpg",
"./map1.jpg",
"./map2.jpg",
"./map3.jpg",
"./map5.jpg",
"./map6.jpg",
"./map7.jpg",
"./map142.jpg",
"./map340.jpg",
"./map341.jpg",
"./map342.jpg",
"./map343.jpg",
"./map344.jpg",
"./map193.jpg",
"./maskable_icon.png",
"./maskable_icon_x128.png",
"./maskable_icon_x192.png",
"./maskable_icon_x384.png",
"./maskable_icon_x48.png",
"./maskable_icon_x512.png",
"./maskable_icon_x72.png",
"./maskable_icon_x96.png",
"./schedule.json",
"./screenshot.png",
"./service-worker.js",
"./star-hover.png",
"./star-off.png",
"./star-on.png",
"./style.css",
"./unheard.png",
"./artists/ahi.jpg",
"./artists/allison-russell.jpg",
"./artists/anna-muskego-nikamowin.jpg",
"./artists/asiah-holm-school-of-song.jpg",
"./artists/av-the-inner-city.jpg",
"./artists/aysanabee.jpg",
"./artists/balthvs.jpg",
"./artists/blackburn-brothers.jpg",
"./artists/blue-moon-marquee.jpg",
"./artists/brianna-lizotte-nikamowin.jpg",
"./artists/burnstick.jpg",
"./artists/calvin-vollrath.jpg",
"./artists/cedric-burnside.jpg",
"./artists/celina-loyer-nikamowin.jpg",
"./artists/charlie-cunningham.jpg",
"./artists/current-swell.jpg",
"./artists/danielle-ponder.jpg",
"./artists/darla-daniels-nikamowin.jpg",
"./artists/de-temps-antan.jpg",
"./artists/dervish.jpg",
"./artists/dry-bones.jpg",
"./artists/ekti-margaret-cardinal-nikamowin.jpg",
"./artists/elizabeth-moen.jpg",
"./artists/florence-shone-nikamowin.jpg",
"./artists/goldie-boutilier.jpg",
"./artists/goota-desmarais-nikamowin.jpg",
"./artists/haley-heynderickx.jpg",
"./artists/halfway-home-school-of-song.jpg",
"./artists/ian-noe.jpg",
"./artists/jeffrey-martin.jpg",
"./artists/jennifer-castle.jpg",
"./artists/jesse-roper.jpg",
"./artists/jesse-welles.jpg",
"./artists/john-butler.jpg",
"./artists/julianna-riolino.jpg",
"./artists/jupiter-okwess.jpg",
"./artists/kehewin-native-dance-theatre-nikamowin.jpg",
"./artists/ken-pomeroy.jpg",
"./artists/kila.jpg",
"./artists/kim-churchill.jpg",
"./artists/las-cafeteras.jpg",
"./artists/levi-wolfe-nikamowin.jpg",
"./artists/list.txt",
"./artists/madi-diaz.jpg",
"./artists/mama-mihirangi-the-mareikura.jpg",
"./artists/mamas-broke.jpg",
"./artists/marcus-trummer.jpg",
"./artists/martyn-joseph.jpg",
"./artists/mary-gauthier.jpg",
"./artists/matt-hiltermann-nikamowin.jpg",
"./artists/melissa-carper.jpg",
"./artists/michael-jody-fraser-nikamowin.jpg",
"./artists/monophonics.jpg",
"./artists/mt-joy.jpg",
"./artists/nipisiy.jpg",
"./artists/rainbow-kitten-surprise.jpg",
"./artists/richy-mitch-the-coal-miners.jpg",
"./artists/ryley-walker-bill-mackay.jpg",
"./artists/sam-steffen-school-of-song.jpg",
"./artists/school-of-song.jpg",
"./artists/secondhand-dreamcar.jpg",
"./artists/serena-ryder.jpg",
"./artists/shaela-miller.jpg",
"./artists/steph-strings.jpg",
"./artists/stephen-wilson-jr.jpg",
"./artists/taj-mahal.jpg",
"./artists/talisk.jpg",
"./artists/tayler-grace-school-of-song.jpg",
"./artists/the-roots.jpg",
"./artists/the-sensational-barnes-brothers.jpg",
"./artists/the-slocan-ramblers.jpg",
"./artists/wesli.jpg",
"./artists/willi-carlisle.jpg",
"./artists/yasmin-williams.jpg"

];

/*
async function delayCacheAddAll(cache, urls, delay) {
  await new Promise(resolve => setTimeout(resolve, delay));
  await cache.addAll(urls);
}

const delayMilliseconds = 2000; // 2 seconds

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => delayCacheAddAll(cache, urlsToAdd, delayMilliseconds))
			.then(() => {
				console.log('Cache.addAll() with delay completed successfully.');
			})
            .catch(error => {
                console.error("Caching failed:", error);
            })
    );
});
*/

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(cacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
            .catch(error => {
                console.error("Caching failed:", error);
            })
    );
});

self.addEventListener("activate", (e) => {
console.log("activate");
      e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key === cacheName) {
            return;
          }
          return caches.delete(key);
        }),
      );
    }),
  );
});

self.addEventListener("fetch", event => {
console.log("fetch");
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(error => {
                console.error("Error fetching from cache:", error);
            })
    );
});
