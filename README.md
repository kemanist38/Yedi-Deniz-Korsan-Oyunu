# Kara Yelken — Gölgeler Denizi

Tarayıcıda çalışan, üstten görünüşlü korsan gemisi savaş prototipi. Tamamen özgün kod ve prosedürel Canvas çizimleri kullanır; üçüncü taraf oyun kodu veya telifli asset içermez.

## Çalıştırma

```bash
npm install
npm run dev
```

StackBlitz'te **Import from GitHub** ile depo adresini açın.

## Kontroller

Varsayılan tuşlar (hepsi **AYARLAR → Klavye kısayolları** bölümünden değiştirilebilir):

- `W / S / A / D` veya ok tuşları: ileri, yavaşla, dümen
- `R`: seçili hedefe saldır / saldırıyı bırak · `F`: tamir
- `Z / X / C`: Rüzgâr Hamlesi, Demir Kalkan, Deniz Mayını
- `1–6`: gülle yuvaları · `7–0`: sarf yuvaları
- `V`: gemiyi ortala · `M`: dünya haritası · `J`: harita atla · `+ / -`: yakınlaştır / uzaklaştır

Ses efektleri WebAudio ile anlık üretilir; AYARLAR'dan açılıp kapatılabilir ve düzeyi ayarlanabilir.

## Ekran düzeni

- **Üst orta:** TP (tecrübe), EP (elit puan), CP (can) ve SP (savaş puanı) çubukları; ortada kaptan seviyesi madalyası.
- **Sağ üst:** altın/inci bakiyesi, **market** düğmesi (sekmeler: Tersane, Toplar, Gülle & Mühimmat, Malzemeler) ve **menü** düğmesi (Kaptan profili, Filo, Geliştirme, Tayfa, Görevler, Dünya haritası, Ayarlar).
- **Sol üst:** mini harita; yanında dünya haritası ve altında görevleri açan korsan kaptan (aktif görevin ilerlemesi rozet olarak görünür).
- **Sol alt:** hızlı gülle/malzeme yuvaları. **Alt orta:** gemiyi ekrana ortalama düğmesi. **Sağ alt:** savaş düğmeleri.

## Atış efektleri

Gülleler kavis çizerek uçar, suda gölgeleri kayar; her güllenin kendi izi vardır (demir: duman, ateş: kor ve alev, zincir: dönen zincirli çift gülle, saçma: yelpaze gibi dağılan taneler, canavar: köpüklü su topu). Atışta namlu alevi ve duman, isabette patlama, savrulup suya düşen kıymıklar ve korlar, ıskada su sütunu çıkar. Havan kulesi atışında hedefe önce kırmızı hedef halkası düşer. Batan gemi yan yatarak kabarcıklar içinde gömülür, arkasında yüzen enkaz kalır. Tüm efektler `public/assets/vfx-atlas-v1.webp` raster atlasındadır (`tools/asset-studio/vfx.js`).

## Dünya: 9 seviye, 18 deniz

Dünya haritası (`M` veya **DÜNYA**) 6 × 3 ızgaradır:

|   |   |   |   |   |   |
|---|---|---|---|---|---|
| 7/1 Kül Adaları | 7/2 Magma Boğazı | 8/1 Şimşek Denizi | 8/2 Kasırga Gözü | 9/1 Gölge Uçurumu | 9/2 Kara Yelken Tahtı |
| 5/1 Ayaz Boğazı | 5/2 Kristal Buzullar | 4/1 Kan Körfezi | 4/2 Paslı Sığlık | 6/1 Zehirli Mangrov | 6/2 Çürük Lagün |
| 1/1 Sığınak Koyu | 1/2 Martı Kıyıları | 2/1 Mercan Geçidi | 2/2 İnci Resifleri | 3/1 Sis Kayalıkları | 3/2 Hayalet Boğazı |

- **Seviye kilidi:** X/Y denizine X. seviyede girilir.
- **Kenardan geçiş:** Denizin kenarına yanaşınca **HARİTA ATLA** istemi çıkar (`J`). Komşu denizlerin yanı sıra 1/1 ↔ 3/2 (yatay) ve 1/1 ↔ 7/1 (dikey) arasında da geçiş vardır.
- **Temalar:** Her seviyenin kendi teması vardır: Zümrüt, Mercan, Sis, Kızıl, Buz, Zehir, Alev, Fırtına, Derinlik. Deniz rengi, adalar, hava efektleri (sis, kar, kor, spor, şimşek…) ve filo adası temaya göre değişir.
- **NPC ve canavarlar:** Her denizin kendine özgü 2 NPC gemisi ve 1 canavarı vardır; toplam 36 gemi ve 18 canavar. Güçleri ve ödülleri seviyeyle artar.
- **1/1 Sığınak Koyu savaşa kapalıdır:** Buradaki gemiler sen saldırmadıkça ateş etmez.
- **Batma ve yeniden doğma:** Batan gemi, hangi denizdeyse orada, düşmanlardan uzak rastgele bir noktada %10 gövdeyle yeniden doğar ve onarıma başlar.
- **Koordinatlar:** Ekranın üstünde soldan sağa **00–60** sütunları, solda yukarıdan aşağı **AA–CZ** satırları vardır. Konumun harita rozetinde `1/1 - 35AJ` biçiminde görünür; oyuncular toplanma yerini bu koordinatla söyleyebilir.

### Filo adaları

Filo adaları 5. seviye ve üstü denizlerde bulunur: sur halkasıyla çevrili, 8 kuleli bir lagün kalesi. Lagüne güneydeki dar kanaldan girilir.
- **Seyir:** Adanın hangi bölümünün kara, hangisinin su olduğu görselden üretilen maskeyle belirlenir (`src/fleetMask.ts`, `tools/asset-studio/fleet-mask.mjs`). Adaya ya da lagüne tıklayınca rota adanın çevresinden dolaşıp kanaldan içeri çizilir; gemi kıyı boyunca kayar, karaya çıkmaz.
- **Kendi filonun adası:** Lagünde gövde kendiliğinden onarılır ve kuleler düşmanlara ateş eder.
- **Rakip ada:** Kuleleri yaklaşan gemiye ateş eder ve filo savaşı ölçeğinde dayanıklıdır; tek gemi yıkamaz. **Test modu (`FLEET_TEST_ENTRY`) açıkken rakip adaların lagününe de girilebilir.**

### Filo (FİLO sekmesi)
- **Filo kur:** Filo kurarken 2–4 karakterlik bir kısaltma (tag, ör. `TC★`) ve filo adı seçilir. Filoyu kuran oyuncu filo başkanı olur. Kısaltma gemi adının önünde görünür: `[TC★]__kemanist__`. Çok oyunculu mod gelene kadar filoda yalnızca sen varsın.
- **İnci bağışı:** Oyuncular filo hazinesine inci bağışlar (+10, +50, +100 ya da istenen miktar).
- **Kuleler adadan bağımsızdır:** Ada görselinde kulelerin yeri boştur; surda 8 taş dikme kaidesi vardır (`fleet-base-v4`). Filo başkanı, hazinedeki inciyle kaideye kule diker; bedeli `20 + 10 × seviye` incidir. Dikilen kule, ada görselindeki burcun birebir aynısıdır (`fleet-bastions-v1`) ve adaya yaklaşan düşmanlara ateş eder. Rakip adalarda NPC filosunun burçları durur.
- Görseller `tools/asset-studio/fleet-bastions.mjs` ile üretilir: burçlar ada görselinden kesilir, yerleri çevre dokusuyla doldurulur ve kaideler çizilir.
- **Kule tipleri** (taş kaideye oturan tam kule, `tools/asset-studio/fleet-towers.js` → `fleet-towers-built-v1`; taş, ahşap ve sancak dokuları ada görselinden örneklenen paletle boyanır, render ada görselinin bakış açısına ve renk ortalamasına eşlenir):
  - **Top Kulesi:** çift namlulu ağır top; dengeli hasar ve menzil (bedel ×1).
  - **Havan Kulesi:** uzun menzil, isabet noktasında 90 birimlik alan hasarı, yavaş dolum (×1,5).
  - **Zincir Kulesi:** zincirli zıpkın; az hasar, vurduğu gemiyi 3 sn %45 yavaşlatır (×1,2).
  - **Fener Kulesi:** ateş etmez; 520 birim içindeki dost gemileri saniyede %3 onarır (×1,3).
- **Yetki:** Kuleyi yalnızca **Filo Başkanı** ve **Başkan Yardımcısı** diker; üyeler hazineye inci bağışlar. Test modunda FİLO sekmesinden kendi rolün değiştirilebilir.
- Fethedilen adanın kaideleri boş gelir. Test modunda bulunduğun denizin adası FİLO sekmesinden doğrudan filoya katılabilir.

### Kaptan adı (KAPTAN sekmesi)
- Gemi altında `[FİLO TAG]nick` ve kaptan rütbesi (Miço → Kaptan-ı Deryâ) yazar.
- İlk kaptan adı ücretsizdir. Sonraki her değişiklik 50 inci tutar ve iki değişiklik arasında 1 gün beklemek gerekir. Nick 3–16 karakterdir; harf, rakam, `_` ve `.` içerebilir.

### Seviye ve görevler

- **Tecrübe (TP):** Seviye atlamak için gereken TP sırasıyla 2.000 / 5.000 / 10.000 / 18.000 / 30.000 / 48.000 / 72.000 / 105.000'dir; en yüksek seviye 9.
- **Seviye ödülü:** Her seviye +20 azami gövde, +10 İnci ve +1 yetenek puanı verir.
- **Görevler:** Her seviyenin 4 görevi vardır: devriye avı, ağır filo, canavar avı ve ganimet avı. Görevler o seviyenin gemi ve canavarlarını hedefler; ödüller seviyeyle artar.
- **Hayalet Amiral:** Savaşa açık denizlerde zamanlı olarak çıkan boss; gücü ve ödülü deniz seviyesine göre değişir.

## Ganimet ve inci pırıltıları

- NPC gemisi batınca sandık düşmez: sandığın ganimeti (altın, kereste, zincir güllesi, bazen inci) TP ile birlikte doğrudan hesabına eklenir. Canavarlar ve Hayalet Amiral yaldızlı sandık bırakmaya devam eder.
- **İnci pırıltıları:** Her denizde 12 parlayan inci vardır. Üzerinden geçince küçük ödül verir (seviyeye göre altın ve TP, %20 ihtimalle 1 inci). Yenisi 4 sn sonra haritada rastgele bir yerde çıkar. Pırıltıya tıklayınca rota çizilir; mini haritada beyaz noktalarla görünür.
- Açık denizde en fazla 4 sürüklenen sandık bulunur. Sandığa tıklayınca rota çizilir, geminle üzerinden geçince toplanır.
- Düşen sandıklar 45–60 saniye sonra kaybolur (son saniyelerde yanıp söner). Mini haritada altın noktalarla gösterilir.

## Raster assetler

36 NPC gemisi (16 yön), 18 canavar (8 karelik animasyon), 10 ada teması, 9 filo adası ve kuleleri, ikonlar, deniz dokusu, ganimet sandıkları, inci pırıltısı animasyonu, elit gemi görselleri (tersane tasarımıyla birebir aynı) ve portre atlası
`tools/asset-studio` içindeki özgün 3B modellerden üretilir ve `public/assets` altına WebP olarak yazılır:

```bash
cd tools/asset-studio
npm install
npm run render            # tüm assetler
npm run render -- leviathan-v1   # tek asset
```

Önizleme PNG'leri `tools/asset-studio/preview/` altına düşer (depoya eklenmez).
