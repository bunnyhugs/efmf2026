const cacheName = "music-festival-schedule-v1.5-efmf2026";
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
"./artists/adam-baldwin.jpg",
"./artists/amble.jpg",
"./artists/anna-muskego-nikamowin.jpg",
"./artists/anna-tivel.jpg",
"./artists/annie-the-caldwells.jpg",
"./artists/arrested-development.jpg",
"./artists/asgeir.jpg",
"./artists/bella-white.jpg",
"./artists/bombino.jpg",
"./artists/brianna-lizotte.jpg",
"./artists/buffalo-traffic-jam.jpg",
"./artists/buyepongo.jpg",
"./artists/carmen-miller-nikamowin.jpg",
"./artists/cat-power.jpg",
"./artists/celina-loyer-nikamowin.jpg",
"./artists/corb-lund.jpg",
"./artists/courtney-marie-andrews.jpg",
"./artists/daby-toure.jpg",
"./artists/dailey-vincent.jpg",
"./artists/damien-okane-ron-block.jpg",
"./artists/dana-sipos.jpg",
"./artists/darla-daniels-nikamowin.jpg",
"./artists/djekady-feat-balla-kouyate-mike-block.jpg",
"./artists/djely-tapa.jpg",
"./artists/dk-harrell.jpg",
"./artists/dove-ellis.jpg",
"./artists/dug.jpg",
"./artists/ekti-margaret-cardinal-nikamowin.jpg",
"./artists/fantastic-cat.jpg",
"./artists/goota-desmarais-nikamowin.jpg",
"./artists/gwenifer-raymond.jpg",
"./artists/hurray-for-the-riff-raff.jpg",
"./artists/jake-xerxes-fussell.jpg",
"./artists/jeffrey-martin.jpg",
"./artists/jeremie-albino.jpg",
"./artists/joe-nolan.jpg",
"./artists/joel-plaskett-emergency.jpg",
"./artists/john-r-miller.jpg",
"./artists/julian-taylor.jpg",
"./artists/kate-rusby.jpg",
"./artists/la-deferlance.jpg",
"./artists/leif-vollebekk.jpg",
"./artists/levi-wolfe-nikamowin.jpg",
"./artists/lyndon-aginas-nikamowin.jpg",
"./artists/madalitso-band.jpg",
"./artists/mariel-buckley.jpg",
"./artists/matt-hiltermann-nikamowin.jpg",
"./artists/metis-child-family-jiggers-nikamowin.jpg",
"./artists/mia-kelly.jpg",
"./artists/nathaniel-rateliff.jpg",
"./artists/nick-mulvey.jpg",
"./artists/ocie-elliott.jpg",
"./artists/of-monsters-and-men.jpg",
"./artists/oskinakosiwin-indigenous-dance-group-nikamowin.jpg",
"./artists/rob-ickes-trey-hensley.jpg",
"./artists/rockin-dopsie-jr-the-zydeco-twisters.jpg",
"./artists/school-of-song-caylie-g-mitch-gorman-paul-cournoyer-the-western-thistles.jpg",
"./artists/sister-ray.jpg",
"./artists/st-paul-the-broken-bones.jpg",
"./artists/supalung.jpg",
"./artists/syml.jpg",
"./artists/the-brudi-brothers.jpg",
"./artists/the-mbira-renaissance-band.jpg",
"./artists/the-milk-carton-kids.jpg",
"./artists/the-pairs.jpg",
"./artists/the-point.jpg",
"./artists/the-womack-sisters.jpg",
"./artists/thee-sacred-souls.jpg",
"./artists/tia-wood.jpg",
"./artists/trousdale.jpg"

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
