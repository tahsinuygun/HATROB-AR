# Hassas Tarım ve Tarımsal Robotlar Bölümü Sanal Laboratuvarı (GitHub Pages)

Bu paket, GitHub repo içindeki **.glb/.gltf** modelleri otomatik listeler.

## Kurulum
1) Zip içeriğini repo köküne yükle.
2) Modelleri repo içinde istediğin klasöre koy (örn. `models/`).
3) GitHub Pages aç:
   - Settings → Pages → Deploy from branch → main / root

## Kullanım
- Android: `android.html`
- iOS: `ios.html`
- QR: `qr.html`
- Tek model direkt açma:
  - `android.html?f=models/ornek.glb`
  - `ios.html?f=models/ornek.glb`

## Not
- GitHub API rate limitine takılırsan sayfayı biraz sonra tekrar yenile.
- iOS için en stabil AR: aynı isimli `.usdz` dosyalarını `usdz/` klasörüne koy.
