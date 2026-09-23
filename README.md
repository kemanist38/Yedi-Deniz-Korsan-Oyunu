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

## Dünya haritaları

| Deniz | Seviye | Özellik |
|---|---|---|
| Sığınak Koyu | 1+ | Güvenli sular: düşman yok, top ateşlenmez, gövde kendiliğinden onarılır. Batan kaptanlar burada doğar. |
| Gölgeler Denizi | 1+ | İlk açık deniz; Kaçakçılar, Yağmacılar, Derinlik Leviathanı. |
| Kızıl Resifler | 4+ | Daha güçlü Yağmacı ve savaş gemisi filoları. |
| Fırtına Kuşağı | 8+ | Şimşekli kara sular, ağır savaş gemileri ve Fırtına Leviathanı. |

Denizler geçitlerle birbirine bağlıdır. Geçide tıklayınca rota çizilir; geçidin içindeyken `J` ya da ekrandaki butonla geçilir.
Sol üstteki **DÜNYA** butonu parşömen haritayı açar; oradan bağlı bir denizin geçidine rota çizilebilir.

## Özel mühimmat

- **Ateş Güllesi:** ×1,2 hasar, hedefi 4 saniye yakar.
- **Saçma:** ×1,6 hasar, menzil %35 kısa.
- Ateş güllesi, saçma ve mayınlar marketten alınır; hızlı yuvalardan seçilir. İlk açılışta tanıtım stoğu verilir.

## Kaptan yetenekleri ve tayfa

**KAPTAN** penceresinde üç sekme bulunur:
- **Yetenekler:** Her seviyede 1 puan. Topçuluk, Denizcilik ve Yağma dallarında 12 yetenek. 5 İnci karşılığında puanlar sıfırlanabilir.
- **Tayfa:** 6 subay (Topçu Başı, Serdümen, Marangoz, Gözcü, Levazımcı, Cerrah) altınla işe alınır ve 5 rütbeye kadar yükseltilir. Aynı anda görevde olabilecek subay sayısı 1 / 2 / 3'tür (seviye 1 / 3 / 6).
- **Profil:** Tüm kaptan ve tayfa bonuslarının toplamı.

## Boss etkinlikleri ve kaleler

- **Hayalet Amiral:** Açık denizlerde ilk kez 90 saniye sonra, yenildikten sonra da 8 dakikada bir belirir. Canı yarıya inince muhafız çağırır ve beşli yaylım ateşine geçer. Batırılınca 3 yaldızlı sandık, altın, inci, şöhret, elit ve savaş puanı verir. Sağdaki etkinlik panelinden rota çizilebilir.
- **Kaleler:** Gölgeler Denizi'nde Fırtına Kalesi, Kızıl Resifler'de Kan Kalesi, Fırtına Kuşağı'nda Kül Kalesi var.
  - NPC kalesinin 4 kulesi yaklaşan gemiye ateş eder; surları yıkılan kale oyuncuya geçer.
  - Oyuncunun kalesi dakikada altın ve kereste üretir; kuleleri düşman gemilerine ateş eder.
  - Kale 10 dakikada bir Yağmacıların kuşatmasına uğrar; garnizon canı biterse kale düşer.
  - GELİŞTİRME → KALELER sekmesinden hasılat toplanır ve kale 3. seviyeye kadar yükseltilir.

## Ganimet sandıkları

- Batan her düşman gemisi, mevcut ödüllerine ek olarak bir ganimet sandığı bırakır; Derinlik Leviathanı yaldızlı sandık bırakır.
- Açık denizde en fazla 4 sürüklenen sandık bulunur. Sandığa tıklayınca rota çizilir, geminle üzerinden geçince toplanır.
- Düşen sandıklar 45–60 saniye sonra kaybolur (son saniyelerde yanıp söner). Mini haritada altın noktalarla gösterilir.

## Raster assetler

Düşman gemileri (16 yön), Leviathan varyantları (8 karelik animasyon), adalar, geçit, deniz dokusu, dünya haritası, ganimet sandıkları ve hedef portreleri
`tools/asset-studio` içindeki özgün 3B modellerden üretilir ve `public/assets` altına WebP olarak yazılır:

```bash
cd tools/asset-studio
npm install
npm run render            # tüm assetler
npm run render -- leviathan-v1   # tek asset
```

Önizleme PNG'leri `tools/asset-studio/preview/` altına düşer (depoya eklenmez).
