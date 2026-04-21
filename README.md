# CinemaHub Web

Bo khung giao dien duoc khoi tao bang React va Vite, su dung JavaScript.

## Scripts

- `npm install`: Cai dat dependencies.
- `npm run dev`: Chay moi truong phat trien local.
- `npm run build`: Build production.
- `npm run preview`: Preview ban build local.

## Cau truc chinh

- `src/`: Ma nguon giao dien React.
- `public/`: Tai nguyen static.
- `vite.config.js`: Cau hinh Vite.

## Ghi chu

## Cau hinh moi truong (QR / API)

De QR code quet ra mo dung trang ve, va trang ve goi dung backend khi deploy, hay khai bao bien moi truong Vite:

- `VITE_PUBLIC_URL`: base URL cua frontend (vi du: `https://cinemahub-web.web.app`). Neu khong set se dung `window.location.origin`.
- `VITE_API_URL`: base URL cua backend (vi du: `https://api.cinemahub.com`). Neu khong set se dung `http://localhost:5000`.

Tao file `.env` trong thu muc `CinemaHub-web/` (khong commit) vi du:

```
VITE_PUBLIC_URL=https://cinemahub-web.web.app
VITE_API_URL=https://cinemahub-api.onrender.com
```

