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

## Özel gülleler

| Gülle | Etki | Market |
|---|---|---|
| Ateş Güllesi | Hedefi 4 sn yakar | 20 adet · 95 altın |
| Saçma | Kısa menzil, yüksek hasar | 25 adet · 80 altın |
| Patlayıcı Gülle | Çarptığı yerde patlar; 120 birim içindeki diğer düşmanlara %50 hasar | 15 adet · 130 altın |
| Kule Kırıcı | Kulelere 2,6 kat hasar; gemilere %85 | 15 adet · 150 altın |
| Can Emici | Verdiği hasarın %25'i kadar gemini onarır | 15 adet · 140 altın |

Yeni üç gülleden her kaptana 10'ar adet tanıtım stoğu verilir; hızlı gülle sırasında yer varsa kendiliğinden yerleşir, yoksa MALZEMELER sekmesinden eklenir.

## Ses efektleri

Tüm sesler asset atölyesinde katman katman tasarlanır (`tools/asset-studio/sfx.js`): namlu çatlağı, barut patlaması gövdesi, orta bant "güm", alt bas desteği, açık denizde yuvarlanan kuyruk ve deniz yankısı. `node tools/asset-studio/sfx.mjs` her sesi birkaç varyantla üretip `public/assets/sfx/*.mp3` dosyalarına ve `src/sfxManifest.ts` listesine yazar. Oyun her çalışta rastgele bir varyantı hafif perde/seviye farkıyla çalar; uzaktaki düşman topları kısık ve boğuk duyulur, ıskalar ve batışlar oyuncuya uzaklığa göre kısılır.

- **Top gövdesi:** döküm, uzun namlu, seri ve ağır top ayrı sesler.
- **Gülle katmanı:** zincir (dönen zincir vınlaması ve şıngırtı), ateş (alev hışırtısı ve kor çıtırtısı), saçma (yayılan patlaklar), patlayıcı (fitil cızırtısı), kule kırıcı (çelik çınlaması ve ıslık), can emici (hayalet iniltisi).
- **Diğer:** gövdeye isabet, küçük/büyük patlama, suya düşme, batış, altın, onarım, kalkan, rüzgâr, seviye atlama (gemi çanı), harita atlama, arayüz tıkırtısı.

## Saldırı

Hedef seçip SALDIR'a basınca, hedef menzildeyken kaptan gemiyi istediği yere sürse bile ateş sürer; rota verilmediyse gemi borda ateşi için hedefin yanına döner. Saldırı menzil dışından başlatılırsa gemi önce hedefe yaklaşır. Hedef menzilden çıkınca saldırı durur ve menzile tekrar girildiğinde SALDIR'a yeniden basmak gerekir. Elit gemilerde saldırı düğmesinin yanında geminin özel yeteneği bulunur.

## Atış efektleri

Gülleler kavis çizerek uçar, suda gölgeleri kayar; her güllenin kendi izi vardır (demir: duman, ateş: kor ve alev, zincir: dönen zincirli çift gülle, saçma: yelpaze gibi dağılan taneler, canavar: köpüklü su topu). Atışta namlu alevi ve duman, isabette patlama, savrulup suya düşen kıymıklar ve korlar, ıskada su sütunu çıkar. Havan kulesi atışında hedefe önce kırmızı hedef halkası düşer. Batan gemi yan yatarak kabarcıklar içinde gömülür, arkasında yüzen enkaz kalır. Tüm efektler `public/assets/vfx-atlas-v1.webp` raster atlasındadır (`tools/asset-studio/vfx.js`).

## Dünya: 8 seviye, 16 deniz

Dünya haritası (`M` veya **DÜNYA**) Seafight tarzı parşömen tomarı üzerinde küçük bir 4 × 4 paftadır (korunaklı 1/1 ve 1/2 yeşil, diğerleri toprak rengi). Her karede sol üstte adaya sahip filonun kısaltması, sağ üstte bulunduğun denizin sancağı, ortada deniz kodu, altta deniz adı yazar:

|   |   |   |   |
|---|---|---|---|
| 7/1 · 7/2 Karanlık Uçurum Denizi | | 8/1 · 8/2 Alev Denizi | |
| 5/1 · 5/2 Buzmahzen Denizi | | 6/1 · 6/2 Fırtına Denizi | |
| 3/1 · 3/2 Azurya Denizi | | 4/1 · 4/2 Hayalet Denizi | |
| 1/1 · 1/2 Güvenli Harita | | 2/1 · 2/2 İnciyolu Denizi | |

- **Harita boyutu:** Seafight'taki gibi 6000 × 4000 birim.
- **Adalar:** Asset atölyesinde 3B tasarlanan 7 ada biçimi (kanca koy, liman kasabası, ikiz tepe limanı, atol, kaya sivrisi, kıvrık kaya, fener tepesi) × 8 deniz teması (`tools/asset-studio/isles.js`). Her denize 12 ada, tohumlu rastgele ve dengeli (titreşimli ızgara) dağıtılır; çarpışma her biçimin kara parçalarını izleyen dairelerle yapılır.

- **Seviye kilidi:** X/Y denizine X. seviyede girilir.
- **Kenardan geçiş:** Denizin kenarına yanaşınca **HARİTA ATLA** istemi çıkar (`J`); paftadaki komşu denize geçilir. Kenarlar sarmaldır: paftanın bir kenarından çıkan karşı kenardan girer (ör. 3/1 ↔ 4/2, 2/1 ↔ 8/1).
- **Seviye = harita:** En yüksek seviye 8, en yüksek deniz de 8/x'tir.
- **Temalar:** Her seviyenin kendi teması vardır: Güvenli, İnciyolu, Azurya, Hayalet, Buzmahzen, Fırtına, Karanlık Uçurum, Alev. Deniz rengi, adalar, hava efektleri (sis, kar, kor, spor, şimşek…) ve filo adası temaya göre değişir.
- **NPC ve canavarlar:** Her denizin kendine özgü 2 NPC gemisi ve 1 canavarı vardır; toplam 32 gemi ve 16 canavar. Güçleri ve ödülleri seviyeyle artar.
- **1/1 Sığınak Koyu ve 1/2 Martı Kıyıları korunaklıdır:** Buradaki gemiler sen saldırmadıkça ateş etmez; boss etkinliği çıkmaz, mayın bırakılamaz.
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
