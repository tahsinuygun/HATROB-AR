# HATROB AR — Hassas Tarım ve Tarımsal Robotlar Bölümü Sanal Laboratuvarı

Tek web arayüzü üzerinden 3B model görüntüleme ve artırılmış gerçeklik demosu.

## Yapı

- `index.html` — tek ana arayüz; Android/iOS ayrımı kullanıcıya gösterilmez.
- `models/` — GLB/GLTF modelleri.
- `usdz/` — iPhone/iPad AR için aynı temel ada sahip USDZ dosyaları.
- `assets/` — logolar ve arayüz görselleri.
- `qr.html` — her model için tek QR üretir.
- `ios.html` ve `android.html` — eski bağlantıların bozulmaması için ana sayfaya yönlendirir.

## Mobil kararlılık

Modeller otomatik yüklenmez. Kullanıcı **Modeli Yükle** düğmesine bastığında açılır. Bu yöntem özellikle büyük GLB dosyalarında mobil bellek kullanımını azaltır.

18 MB üzerindeki dosyalar arayüzde ağır model olarak işaretlenir. Mobil kullanım için mümkünse:
- modeli 15–20 MB altında tutun,
- texture çözünürlüklerini gereksiz büyütmeyin,
- gereksiz mesh ve materyalleri temizleyin,
- animasyonları yalnızca gerektiğinde kullanın.

## Tek modele bağlantı

`https://tahsinuygun.github.io/HATROB-AR/?f=models/PI5.glb`

## iPhone/iPad AR

Gerçek AR için modelle aynı temel ada sahip bir USDZ dosyasını `usdz/` klasörüne ekleyin. USDZ yoksa aynı ana sayfada 3B önizleme kullanılabilir.
