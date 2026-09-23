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

Her denizde bir filo adası vardır: düzensiz kumsallı ormanlık bir ada, koyu mazgallı taş sur halkası, surun üzerinde 8 sekizgen konik çatılı kule, ortada piramit ahşap çatılı taş burç ve güneydeki kanalla denize açılan iskeleli bir lagün.
- **Kendi filonun adası:** Güneydeki kanaldan lagüne girilir (rota otomatik olarak kanal ağzından çizilir); lagünde gövde kendiliğinden onarılır ve kuleler düşmanlara ateş eder.
- **Rakip ya da tarafsız ada:** İçine girilemez. Kuleleri yaklaşan gemiye ateş eder ve filo savaşı ölçeğinde dayanıklıdır; tek gemi yıkamaz.

### Seviye ve görevler

- **Tecrübe (TP):** Seviye atlamak için gereken TP sırasıyla 2.000 / 5.000 / 10.000 / 18.000 / 30.000 / 48.000 / 72.000 / 105.000'dir; en yüksek seviye 9.
- **Seviye ödülü:** Her seviye +20 azami gövde, +10 İnci ve +1 yetenek puanı verir.
- **Görevler:** Her seviyenin 4 görevi vardır: devriye avı, ağır filo, canavar avı ve ganimet avı. Görevler o seviyenin gemi ve canavarlarını hedefler; ödüller seviyeyle artar.
- **Hayalet Amiral:** Savaşa açık denizlerde zamanlı olarak çıkan boss; gücü ve ödülü deniz seviyesine göre değişir.

## Ganimet sandıkları

- Batan her düşman gemisi, mevcut ödüllerine ek olarak bir ganimet sandığı bırakır; Derinlik Leviathanı yaldızlı sandık bırakır.
- Açık denizde en fazla 4 sürüklenen sandık bulunur. Sandığa tıklayınca rota çizilir, geminle üzerinden geçince toplanır.
- Düşen sandıklar 45–60 saniye sonra kaybolur (son saniyelerde yanıp söner). Mini haritada altın noktalarla gösterilir.

## Raster assetler

36 NPC gemisi (16 yön), 18 canavar (8 karelik animasyon), 10 ada teması, 9 filo adası ve kuleleri, ikonlar, deniz dokusu, ganimet sandıkları ve portre atlası
`tools/asset-studio` içindeki özgün 3B modellerden üretilir ve `public/assets` altına WebP olarak yazılır:

```bash
cd tools/asset-studio
npm install
npm run render            # tüm assetler
npm run render -- leviathan-v1   # tek asset
```

Önizleme PNG'leri `tools/asset-studio/preview/` altına düşer (depoya eklenmez).
