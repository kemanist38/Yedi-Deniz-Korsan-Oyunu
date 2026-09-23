# Kara Yelken — Gölgeler Denizi

Tarayıcıda çalışan, üstten görünüşlü korsan gemisi savaş prototipi. Tamamen özgün kod ve prosedürel Canvas çizimleri kullanır; üçüncü taraf oyun kodu veya telifli asset içermez.

## Çalıştırma

```bash
npm install
npm run dev
```

StackBlitz'te **Import from GitHub** ile depo adresini açın.

## Kontroller

- `W / S`: hızlan / geri git
- `A / D`: dümen
- `Q / E`: sol / sağ borda ateşi
- `Space`: iki bordadan ateş
- `F`: Kül Limanı yakınındayken limanı aç

## Ganimet sandıkları

- Batan her düşman gemisi, mevcut ödüllerine ek olarak bir ganimet sandığı bırakır; Derinlik Leviathanı yaldızlı sandık bırakır.
- Açık denizde en fazla 4 sürüklenen sandık bulunur. Sandığa tıklayınca rota çizilir, geminle üzerinden geçince toplanır.
- Düşen sandıklar 45–60 saniye sonra kaybolur (son saniyelerde yanıp söner). Mini haritada altın noktalarla gösterilir.

## Raster assetler

Düşman gemileri (16 yön), Derinlik Leviathanı (8 karelik animasyon), ganimet sandıkları ve hedef portreleri
`tools/asset-studio` içindeki özgün 3B modellerden üretilir ve `public/assets` altına WebP olarak yazılır:

```bash
cd tools/asset-studio
npm install
npm run render            # tüm assetler
npm run render -- leviathan-v1   # tek asset
```

Önizleme PNG'leri `tools/asset-studio/preview/` altına düşer (depoya eklenmez).
