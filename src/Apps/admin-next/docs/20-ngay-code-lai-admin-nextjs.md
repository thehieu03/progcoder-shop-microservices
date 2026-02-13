# Ke hoach 20 ngay code lai project Admin Next.js

Muc tieu: Sau 20 ngay, ban co the tu code lai duoc core project, hieu luong API, Redux, routing, auth mock, i18n (Tieng Viet/Tieng Anh), va tu tin mo rong them tinh nang.

## Cach hoc de dat hieu qua cao

- Moi ngay chia 3 phien: 90p hoc + 90p code + 30p tong ket.
- Khong copy/paste vo thuc: doc xong phai tu go lai.
- Moi ngay phai co output ro rang: code chay duoc, note duoc, commit duoc.
- Cuoi ngay tu tra loi 3 cau:
  - Hom nay minh hieu duoc gi?
  - Cai gi van mo ho?
  - Ngay mai can lam gi de dong khoang trong?

## Dinh nghia "xong" cho tung ngay

- Co commit voi message ro rang.
- Co screenshot/ghi chu ket qua chay.
- Co 5-10 dong note trong `docs/learning-log.md` (tu tao file nay khi hoc).

---

## Ngay 1-5: Nen tang Next.js + project structure

### Ngay 1 - Khoi dong va map project
- Muc tieu: hieu tong quan project hien tai.
- Viec lam:
  - Chay `npm install`, `npm run dev`.
  - Di qua cac thu muc: `src/app`, `src/components`, `src/store`, `src/services`, `src/api`, `src/contexts`, `src/i18n`.
  - Ve so do luong request tu UI -> service -> api -> response.
- Ket qua can dat: 1 file ghi chu kien truc tong quan (1-2 trang).

### Ngay 2 - Next.js App Router co ban
- Muc tieu: nam duoc `app` router, layout, page, group route.
- Viec lam:
  - Tao mini app moi (demo) voi `app/page.tsx`, `app/(auth)/login/page.tsx`, `app/(dashboard)/dashboard/page.tsx`.
  - Luyen `redirect`, `useRouter`, `usePathname`.
- Ket qua can dat: tu giai thich duoc tai sao route login va dashboard tach group.

### Ngay 3 - Tailwind + UI component pattern
- Muc tieu: hieu UI architecture dang dung.
- Viec lam:
  - Rebuild 3 component: Button, Input, Card theo style project.
  - Them 1 trang demo render cac component.
- Ket qua can dat: tao duoc UI component co props ro rang, tai su dung.

### Ngay 4 - State local vs global
- Muc tieu: phan biet khi nao dung `useState`, khi nao dung Redux.
- Viec lam:
  - Tao 1 feature todo nho: filter local state + global selected item state.
  - Viet note quy tac chon state pattern.
- Ket qua can dat: doc lai code biet ngay state nao nen dua vao Redux.

### Ngay 5 - Middleware va auth gate co ban
- Muc tieu: hieu gate route bang middleware + cookie.
- Viec lam:
  - Rebuild logic middleware: chua auth -> `/login`, da auth -> vao dashboard.
  - Test bang cookie `auth_status`.
- Ket qua can dat: tu viet duoc middleware guard route.

---

## Ngay 6-10: Redux + API layer

### Ngay 6 - Redux Toolkit can ban
- Muc tieu: hieu store, slice, action, reducer.
- Viec lam:
  - Tu tao store moi.
  - Tao `authSlice` (user, isAuth), `layoutSlice` (menu, theme).
  - Dung `useSelector`, `useDispatch` tren 1 trang test.
- Ket qua can dat: khong can nhin tai lieu van tao duoc 1 slice moi.

### Ngay 7 - RTK Query hoac service pattern hien tai
- Muc tieu: hieu cach project goi API.
- Viec lam:
  - Doc `src/store/api/*` va `src/services/*`.
  - Rebuild 1 flow: lay danh sach san pham.
  - Them loading/error/success state.
- Ket qua can dat: giai thich duoc du lieu di qua tung lop.

### Ngay 8 - Axios instance + interceptor
- Muc tieu: hieu token, xu ly 401, retry/redirect.
- Viec lam:
  - Tao lai `axiosInstance` co request/response interceptor.
  - Mock 401 de test redirect login.
- Ket qua can dat: nam duoc cach tap trung xu ly loi API.

### Ngay 9 - Mock API (Mirage) de hoc nhanh
- Muc tieu: hieu cach fake backend de dev frontend.
- Viec lam:
  - Khoi tao mock server (bat/tat qua env).
  - Tao endpoint mock: login, products, orders.
- Ket qua can dat: project chay duoc khong can backend that.

### Ngay 10 - Thuc hanh login flow day du
- Muc tieu: code tu dau fake login `admin/admin`.
- Viec lam:
  - Login form, validate credential.
  - Dispatch `setUser`, set cookie, redirect dashboard.
  - Logout clear state + clear cookie.
- Ket qua can dat: hoan thanh auth flow mini tu dau den cuoi.

---

## Ngay 11-15: Feature theo domain

### Ngay 11 - Catalog module
- Muc tieu: tao module quan ly san pham.
- Viec lam:
  - List + search + pagination.
  - Detail page.
- Ket qua can dat: 1 module hoan chinh co route rieng.

### Ngay 12 - Category/Brand module
- Muc tieu: hieu quan he du lieu don gian.
- Viec lam:
  - CRUD category.
  - CRUD brand.
  - Validate input.
- Ket qua can dat: flow CRUD chay voi mock API.

### Ngay 13 - Order module
- Muc tieu: hieu trang thai don hang va cap nhat status.
- Viec lam:
  - Danh sach order, detail order.
  - Action update status.
- Ket qua can dat: state cap nhat dung sau khi action.

### Ngay 14 - Inventory/Discount module
- Muc tieu: doc duoc code service phuc tap hon.
- Viec lam:
  - Tao man inventory list + cap nhat ton kho.
  - Tao discount list + validate coupon mock.
- Ket qua can dat: hieu pattern mo rong module moi.

### Ngay 15 - Refactor feature folder
- Muc tieu: sap xep lai code de de maintain.
- Viec lam:
  - Chia theo layer `core` / `shared` / `features`.
  - Chuan hoa import alias.
- Ket qua can dat: structure ro rang, import nhat quan.

---

## Ngay 16-20: i18n + optimize + tu code lai

### Ngay 16 - i18n co ban (VI/EN)
- Muc tieu: hieu `react-i18next`.
- Viec lam:
  - Tao resources `vi` va `en`.
  - Biet chuyen ngon ngu tu UI.
  - Doi text trang login/dashboard theo ngon ngu.
- Ket qua can dat: chuyen VI/EN real-time khong reload.

### Ngay 17 - i18n nang cao
- Muc tieu: xu ly key theo module.
- Viec lam:
  - Tach namespace: `common`, `auth`, `catalog`, `order`.
  - Them fallback va quy uoc dat key.
- Ket qua can dat: team co the scale i18n de dang.

### Ngay 18 - Error handling + toast + empty/loading state
- Muc tieu: nang chat luong UX khi goi API.
- Viec lam:
  - Chuan hoa helper xu ly loi.
  - Them loading skeleton/empty state cho 2 man hinh.
  - Them toast cho create/update/delete.
- Ket qua can dat: UI co du trang thai can thiet.

### Ngay 19 - Tu code lai mini project tu dau
- Muc tieu: kiem tra kha nang "tu lam khong nhin".
- Viec lam:
  - Tu tao mini admin: login + dashboard + product list + i18n.
  - Tu setup Redux + API mock + middleware guard.
- Ket qua can dat: mini project chay doc lap.

### Ngay 20 - Tong ket va nang cap
- Muc tieu: dong chu ky hoc.
- Viec lam:
  - Review toan bo note 19 ngay.
  - Liet ke 10 bai hoc lon nhat.
  - Lap backlog 30 ngay tiep theo (test, CI/CD, performance, security).
- Ket qua can dat: roadmap tiep theo ro rang, co huong phat trien.

---

## Lich hoc moi ngay (goi y)

- 08:00-09:30: Doc code + note.
- 10:00-11:30: Code feature bai hoc trong ngay.
- 14:00-15:00: Debug + doc output.
- 21:00-21:30: Tong ket, commit, chot cau hoi.

## Checklist ky nang can dat sau 20 ngay

- Hieu duoc App Router, layout, middleware.
- Tu setup duoc Redux Toolkit + store + slices.
- Hieu luong API qua service/RTK Query va interceptor.
- Tu code duoc fake auth `admin/admin` va guard route.
- Tu setup duoc i18n VI/EN theo namespace.
- Tu to chuc duoc folder structure de scale.

## Lenh hay dung trong qua trinh hoc

```bash
npm run dev
npm run lint
npm run build
```

---

## Ban nang cao (danh cho nguoi co nhieu thoi gian)

Muc nay giup ban hoc "sau" hon ban co ban. Neu theo du muc nay, sau 20 ngay ban khong chi code lai duoc, ma con hieu cach toi uu va van hanh.

### 1) Nang cap muc tieu tung tuan

- Tuan 1 (Ngay 1-5): Foundation + architecture mapping
- Tuan 2 (Ngay 6-10): Redux + API + auth flow hoan chinh
- Tuan 3 (Ngay 11-15): Feature implementation + refactor structure
- Tuan 4 (Ngay 16-20): i18n + testing + production mindset + capstone

### 2) Chuan dau ra moi ngay (Definition of Done 2.0)

Moi ngay can du 8 dau ra sau:

1. Chay duoc tren local (`npm run dev`).
2. Khong vo lint (`npm run lint`) sau khi commit.
3. Co ghi chu ky thuat toi thieu 10 dong.
4. Co 1 commit dung nghia (theo ngay).
5. Co 1 screenshot/clip ngan (neu co UI).
6. Co 1 cau hoi "vi sao" da duoc tra loi.
7. Co 1 list loi gap + cach fix.
8. Co 1 viec nho cho ngay mai (next action).

### 3) Muc tieu ky nang theo cap do

- Level A (Lam chay): Biet gan duoc vao codebase.
- Level B (Hieu logic): Giai thich luong du lieu, biet debug.
- Level C (Lam chu): Tu setup tu dau, tu ra quyet dinh structure.

Muc tieu cua ban la dat toi thieu Level B toan bo va Level C cho auth/API/Redux.

---

## Lo trinh chi tiet hon theo 4 track song song

Thay vi hoc tung file roi quen, ban hoc theo 4 track ben duoi, moi ngay cham mot it vao tat ca track.

### Track A - Next.js Architecture

- App Router, route groups, layout nested.
- Middleware/proxy guard.
- Server component vs client component.
- Navigation + redirect + loading states.

### Track B - Data Layer (API + Redux)

- Axios instance + interceptor.
- Service layer conventions.
- Redux Toolkit slices.
- RTK Query (neu ap dung).
- Error handling va retry.

### Track C - Auth + Security co ban

- Mock auth `admin/admin`.
- Cookie auth gate + route protection.
- Logout/clear state.
- Token refresh concept (doc va mo phong).

### Track D - i18n + UX quality

- `react-i18next` namespace.
- VI/EN switch + fallback.
- Date/number formatting theo locale.
- Empty/loading/error UX pattern.

---

## Day-by-day nang cao (bo sung bai tap sau moi ngay)

Luu y: day la bai tap them cho moi ngay (ngoai phan chinh ben tren).

### Ngay 1 them
- Bai tap: Ve so do dependency bang tay (features -> services -> api -> types).
- Checkpoint: Giai thich duoc vi sao can alias import.

### Ngay 2 them
- Bai tap: Tao them 1 route group moi `(lab)` va 2 page demo.
- Checkpoint: Hieu cach segment layout anh huong toi render.

### Ngay 3 them
- Bai tap: Viet 1 component co bien the (size, variant, loading).
- Checkpoint: Tranh duplicate class Tailwind.

### Ngay 4 them
- Bai tap: Chon 5 state trong app va phan loai local/global/server state.
- Checkpoint: Giai thich ly do chon.

### Ngay 5 them
- Bai tap: Thu 4 tinh huong middleware:
  - Khong cookie vao dashboard.
  - Co cookie vao login.
  - Cookie het han.
  - Cookie sai gia tri.

### Ngay 6 them
- Bai tap: Viet them 1 slice `uiSlice` (toast, modal).
- Checkpoint: Biet tach action sync va async.

### Ngay 7 them
- Bai tap: Tu viet lai 1 service `catalogService` khong nhin code.
- Checkpoint: Co typing request/response ro rang.

### Ngay 8 them
- Bai tap: Mock 3 ma loi 401/403/500 va map thong diep UI.
- Checkpoint: Tat ca loi API co 1 noi xu ly thong nhat.

### Ngay 9 them
- Bai tap: Tao endpoint mock co pagination + filter.
- Checkpoint: Frontend dong bo query params dung.

### Ngay 10 them
- Bai tap: Viet flow login fake day du:
  - input validate
  - dispatch setUser
  - set cookie
  - redirect
  - logout

### Ngay 11 them
- Bai tap: Product list co search debounce 300ms.
- Checkpoint: Khong spam API khi go nhanh.

### Ngay 12 them
- Bai tap: CRUD category va brand co form validation.
- Checkpoint: Toast dung cho create/update/delete.

### Ngay 13 them
- Bai tap: Order status machine mini (pending -> processing -> done/cancel).
- Checkpoint: Ngan update status khong hop le.

### Ngay 14 them
- Bai tap: Inventory co warning threshold ton kho.
- Checkpoint: Hien trang thai mau sac theo nguong.

### Ngay 15 them
- Bai tap: Refactor 1 module sang `features/<name>` va viet note migration.
- Checkpoint: Khong vo import cycle.

### Ngay 16 them
- Bai tap: Them 20 key i18n cho auth + catalog (VI/EN).
- Checkpoint: Khong hardcode text trong component.

### Ngay 17 them
- Bai tap: Pluralization cho cart/item; format date theo locale.
- Checkpoint: Chuyen ngon ngu khong reload va khong loi hydrate.

### Ngay 18 them
- Bai tap: Dung 3 trang thai loading/empty/error cho it nhat 2 module.
- Checkpoint: UX nhat quan.

### Ngay 19 them
- Bai tap: Build mini admin from scratch trong folder rieng (hoac repo rieng).
- Checkpoint: Hoan thanh trong 1 ngay khong copy.

### Ngay 20 them
- Bai tap: Tu danh gia theo scorecard (muc duoi) va lap backlog 30 ngay tiep.
- Checkpoint: Biet ro diem manh, diem yeu, huong tang toc.

---

## Scorecard tu cham diem (100 diem)

- Architecture (20 diem)
  - Hieu route/layout/middleware
  - Biet tach layers ro
- Redux + Data flow (20 diem)
  - Slice/action/selector
  - Giai thich duoc luong dispatch -> UI
- API integration (20 diem)
  - Interceptor + error handling
  - Service typing ro rang
- Auth flow (15 diem)
  - Login/logout/guard/cookie
- i18n (10 diem)
  - Namespace, fallback, switch VI/EN
- Debug + tooling (10 diem)
  - Lint/build/devtools
- Code quality (5 diem)
  - Naming, file structure, consistency

Xep loai:
- 90-100: Co the tu lam feature moi doc lap
- 75-89: On, can them thuc chien
- 60-74: Hieu nen tang, can luyen tiep
- <60: Can hoc lai track con thieu

---

## Ke hoach kiem tra cuoi ky (Capstone)

Trong Ngay 19-20, ban phai hoan thanh mini capstone sau:

- Module bat buoc:
  - Login fake `admin/admin`
  - Dashboard page
  - Product list + detail
  - Language switch VI/EN
- Yeu cau ky thuat:
  - Redux auth + product state
  - API layer tach rieng
  - Middleware route guard
  - Lint pass, build pass
- Bao cao cuoi:
  - So do kien truc 1 trang
  - 5 bai hoc lon nhat
  - 3 loi da gap va cach xu ly

---

## Goi y cach chia thoi gian neu ban hoc full-time

- Buoi sang (deep work): architecture + coding core (2-3 gio).
- Buoi chieu: feature implementation + bugfix (2-3 gio).
- Buoi toi: tong ket + viet note + commit clean (45-60p).

Neu hoc full-time, ban co the tang them:
- 30-45p doc documenation chinh chu moi ngay.
- 30p refactor code vua viet de luyen clean code.

---

## Tai lieu nen doc song song (uu tien)

- Next.js App Router docs (routing, layouts, middleware/proxy).
- Redux Toolkit docs (slices, async, RTK Query).
- Axios docs (interceptors, error handling).
- react-i18next docs (namespaces, interpolation, plural).
- MirageJS docs (neu dung mock server trong local).

---

## Cach su dung bo docs nay trong repo

1. Doc file nay de biet roadmap tong the.
2. Mo `docs/tracker-20-ngay.md` de tick task theo ngay.
3. Moi ngay copy `docs/templates/day-template.md` thanh `docs/days/day-XX.md`.
4. Cuoi ngay cap nhat diem trong `docs/scorecard.md`.

Ban da co roadmap day du. Neu ban giu ky luat theo dung checklist, 20 ngay la du de code lai core project va hieu sau logic Redux/API/i18n.


---

## Phụ lục Bổ Sung - Execution Playbook Siêu Chi Tiết

Mục tiêu phần này: giữ nguyên roadmap 20 ngày hiện tại, nhưng thêm lớp vận hành chi tiết để bạn học sâu mà không bị trôi task.

### A) Definition of Done 3 tầng (áp dụng cho mọi ngày)

#### Tầng 1 - Functional Done

- Tính năng chính của ngày chạy được ở local.
- Có đầy đủ state cơ bản: loading / success / error (nếu có API).
- Không có lỗi runtime blocker.

#### Tầng 2 - Engineering Done

- `npm run lint` pass.
- `npm run build` pass.
- Không phát sinh import path sai hoặc dependency dư rõ ràng.

#### Tầng 3 - Learning Done

- Có learning log tối thiểu 10-15 dòng.
- Có ít nhất 3 ý "vì sao" (không chỉ "đã làm gì").
- Có next action cụ thể cho ngày hôm sau.

---

### B) Bộ câu hỏi tự kiểm cuối ngày (bắt buộc)

1. Nếu xoá file vừa làm, ngày mai bạn có tự code lại từ đầu được không?
2. Bạn có thể giải thích luồng dữ liệu bằng sơ đồ 5 bước không?
3. Có điểm nào bạn đang làm theo thói quen mà chưa hiểu bản chất?
4. Có đoạn nào đang "chạy được nhưng không chắc"?
5. Nếu teammate mới vào, họ đọc phần bạn viết có hiểu trong 10 phút không?

Nếu có từ 2 câu trả lời "không", ngày đó chưa nên tick hoàn thành.

---

### C) Chuẩn artifact cần lưu mỗi ngày

- `docs/days/day-XX.md`: learning log chính.
- `docs/evidence/day-XX/dev.log`: log chạy dev.
- `docs/evidence/day-XX/lint.log`: log lint.
- `docs/evidence/day-XX/build.log`: log build.
- `docs/evidence/day-XX/screenshot-*.png`: ảnh UI/flow quan trọng.
- `docs/evidence/day-XX/decision-log.md` (nếu có quyết định kiến trúc đáng chú ý).

Gợi ý tối thiểu:
- 1 ảnh màn hình chính.
- 1 ảnh hoặc log chứng minh handling lỗi/loading.

---

### D) Commit convention cho lộ trình 20 ngày

Format khuyến nghị:

```text
day-XX(scope): <outcome>
```

Ví dụ:

```text
day-03(ui): rebuild button-input-card with reusable variants
day-07(api): wire catalog list through service flow with loading states
day-10(auth): finish fake login logout and route guard integration
```

Quy tắc:
- Một ngày tối thiểu 1 commit "clean".
- Không commit file rác (`.next`, cache, temp files).
- Message mô tả outcome, không mô tả thao tác lặt vặt.

---

### E) Bảng checkpoint theo mốc 5 ngày (để không lệch hướng)

#### Mốc Day 05

- Đã nắm App Router + route groups + middleware.
- Có 1 flow guard chạy ổn với cookie mock.
- Có ghi chú rõ local state vs global state.

#### Mốc Day 10

- Có auth flow fake hoàn chỉnh: login -> set state -> guard -> logout.
- Có API layer rõ: service hoặc RTK Query (chọn 1 hướng chính).
- Có ít nhất 1 module CRUD mini chạy với mock.

#### Mốc Day 15

- Có ít nhất 3 module domain (catalog/category/order) chạy ổn.
- Structure đã chuẩn hóa theo `core/shared/features` hoặc kiến trúc bạn chọn.
- Import alias nhất quán, giảm duplicate code rõ rệt.

#### Mốc Day 20

- Hoàn thành capstone mini admin độc lập.
- Có scorecard cuối kỳ + backlog 30 ngày tiếp.
- Có thể demo và giải thích kiến trúc không cần nhìn note.

---

### F) Risk Register (rủi ro thường gặp + cách chặn sớm)

| Rủi ro | Dấu hiệu sớm | Cách chặn |
|-------|--------------|-----------|
| Trôi scope mỗi ngày | Day log quá dài nhưng thiếu output chạy được | Chốt 1 outcome chính/ngày, phần dư đẩy backlog |
| Học nhiều mà quên nhanh | Không có decision log / không tự giải thích lại được | Cuối ngày ghi 3 quyết định và 3 lý do |
| Lệch kiến trúc repo gốc | Code mới đẹp nhưng không map được vào code cũ | Mỗi 2 ngày làm 1 phiên "đối chiếu AS-IS" |
| Build/lint fail kéo dài | Tồn đọng warning/lỗi qua nhiều ngày | Không được tick ngày khi lint/build chưa pass |
| Phụ thuộc mock quá lâu | UI chạy nhưng không chuyển được API thật | Chuẩn hóa contract types ngay từ ngày đầu module |

---

### G) Cách nâng cấp chi tiết cho từng file day-XX.md

Mỗi file day nên có thêm 5 phần chi tiết này:

1. **Architecture delta**
   - Hôm nay thay đổi kiến trúc chỗ nào so với hôm qua?
2. **Decision log**
   - Quyết định A/B + lý do + hệ quả.
3. **Verification matrix**
   - Command nào chạy, expected gì, actual gì.
4. **Failure notes**
   - Lỗi nào gặp, fix ra sao, còn nợ gì.
5. **Carry-over tasks**
   - Việc dở dang chuyển sang ngày sau (không để mơ hồ).

---

### H) Rubric chấm điểm ngày (tham khảo nhanh 10 điểm)

- 0-2: Chỉ đọc, chưa có output chạy.
- 3-4: Có code chạy nhưng thiếu kiểm chứng.
- 5-6: Có output + có log cơ bản.
- 7-8: Có output + lint/build + learning rõ.
- 9-10: Có chiều sâu kỹ thuật, giải thích được lý do thiết kế.

---

### I) Checklist "đủ chi tiết" trước khi bạn chốt 1 ngày

- [ ] Có mục tiêu đầu ngày đo được.
- [ ] Có output chạy được bằng lệnh cụ thể.
- [ ] Có ít nhất 1 đoạn giải thích "vì sao chọn cách này".
- [ ] Có log hoặc screenshot làm bằng chứng.
- [ ] Có phần lỗi đã gặp và cách xử lý.
- [ ] Có kế hoạch ngày mai theo block thời gian.

Nếu bạn muốn học sâu (không học cho có), checklist này là bắt buộc.

---

### J) Gợi ý phân bổ thời gian "deep detail" cho người học nghiêm túc

- 45p: đọc code + vẽ map luồng dữ liệu.
- 90p: code outcome chính trong ngày.
- 45p: test + lint + build + chỉnh lỗi.
- 30p: viết learning log + decision log.
- 15p: chuẩn bị task ngày sau.

Tổng: 3.75 giờ/ngày (đủ sâu nhưng vẫn bền).

---

### K) Kết luận bổ sung

Roadmap hiện tại của bạn đã rất tốt về khung.
Điểm cần nâng để thật sự "chi tiết và học chắc":

- chi tiết theo **bằng chứng thực thi**,
- chi tiết theo **quyết định kỹ thuật**,
- chi tiết theo **kiểm chứng chất lượng**,
- không chỉ chi tiết theo số lượng chữ/code mẫu.

Nếu giữ đúng playbook này, tài liệu của bạn sẽ vừa chi tiết, vừa có giá trị thực chiến cao.
