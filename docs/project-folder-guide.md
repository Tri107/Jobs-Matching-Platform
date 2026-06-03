# Project Folder Guide - AI Job Matching Platform

Tài liệu này mô tả **mục đích sử dụng của các thư mục chính trong project** để các thành viên hiểu nên code phần nào, đặt file ở đâu và tránh để logic sai chỗ.

# 1. Tổng quan project

Project chia thành 2 phần chính:

```txt
JOBS-MATCHING/
├── frontend/   # Giao diện người dùng
├── backend/    # API serverless, Lambda functions, DynamoDB logic
└── docs/       # Tài liệu nhóm
```

Stack hiện tại:

```txt
Frontend: Next.js + React + TypeScript + Tailwind CSS
Backend: Node.js + TypeScript + Serverless Framework
Database: DynamoDB
Deploy backend: AWS Lambda + API Gateway
```

---

# 2. Frontend

Thư mục `frontend/` chứa toàn bộ phần giao diện người dùng.

Cấu trúc chính:

```txt
frontend/
├── public/
└── src/
    ├── app/
    ├── components/
    ├── features/
    │   ├── auth/
    │   └── jobs/
    ├── lib/
    └── types/
```

---

## 2.1 `public/`

Chứa tài nguyên tĩnh của frontend.

Dùng cho:

```txt
logo
ảnh minh họa
icon
favicon
file tĩnh public
```

Ví dụ:

```txt
public/
├── logo.png
├── favicon.ico
└── images/
```

Khi đặt file trong `public/`, có thể dùng trực tiếp theo đường dẫn:

```txt
/logo.png
/images/banner.png
```

---

## 2.2 `src/`

Đây là thư mục chứa toàn bộ source code chính của frontend.

```txt
src/
├── app/
├── components/
├── features/
├── lib/
└── types/
```

Quy tắc chung:

```txt
app/         định nghĩa page và layout
components/ component dùng chung nhiều nơi
features/   code theo từng chức năng
lib/        hàm dùng chung, API client, constants
types/      type/interface dùng chung
```

---

## 2.3 `src/app/`

Thư mục `app/` là nơi định nghĩa route/page của Next.js.

Mỗi folder trong `app/` thường tương ứng với một route trên trình duyệt.

Ví dụ:

```txt
src/app/
├── layout.tsx
├── page.tsx
├── jobs/
│   └── page.tsx
├── favorites/
│   └── page.tsx
├── matching/
│   └── page.tsx
└── upload-cv/
    └── page.tsx
```

Ý nghĩa:

```txt
src/app/page.tsx              trang chủ
src/app/jobs/page.tsx         trang danh sách job
src/app/favorites/page.tsx    trang job yêu thích
src/app/matching/page.tsx     trang phân tích CV với job
src/app/upload-cv/page.tsx    trang upload CV
src/app/layout.tsx            layout chung của toàn bộ app
```

Mục đích của `app/`:

```txt
định nghĩa URL
ghép các component thành page hoàn chỉnh
xử lý layout chung
điều hướng giữa các trang
```

Không nên đặt quá nhiều logic gọi API hoặc xử lý nghiệp vụ trực tiếp trong `page.tsx`. Page nên gọi component hoặc hook từ `features/`.

---

## 2.4 `src/components/`

Chứa các component giao diện dùng chung ở nhiều nơi trong app.

Ví dụ:

```txt
src/components/
├── Navbar.tsx
├── Button.tsx
├── Input.tsx
├── Loading.tsx
├── Modal.tsx
└── EmptyState.tsx
```

Dùng cho:

```txt
Navbar chung
Button dùng lại
Input dùng lại
Loading spinner
Modal xác nhận
Empty state khi không có dữ liệu
```

Quy tắc:

```txt
Component dùng nhiều feature khác nhau → đặt trong components/
Component chỉ phục vụ riêng jobs/auth/cv/matching → đặt trong features/<feature>/components/
```

Ví dụ:

```txt
Navbar.tsx        → components/
Button.tsx        → components/
JobCard.tsx       → features/jobs/components/
CvUploadBox.tsx   → features/cv/components/
```

---

# 3. `src/features/`

Thư mục `features/` là nơi chia code frontend theo từng chức năng lớn của hệ thống.

Hiện tại project có:

```txt
src/features/
├── auth/
└── jobs/
```

Mỗi feature nên có cấu trúc nội bộ rõ ràng.

Mẫu chung:

```txt
src/features/<feature-name>/
├── components/
├── hooks/
├── services/
├── utils/
└── types.ts
```

Ý nghĩa các thư mục trong một feature:

```txt
components/  component chỉ dùng cho feature đó
hooks/       custom hook xử lý state, gọi API, logic giao diện
services/    hàm gọi API backend liên quan đến feature
utils/       hàm xử lý nhỏ chỉ dùng trong feature đó
types.ts     type/interface riêng của feature
```

---

## 3.1 `features/auth/`

Dùng cho chức năng xác thực người dùng.

Mục đích:

```txt
đăng nhập
đăng ký
đăng xuất
lưu thông tin user hiện tại
kiểm tra trạng thái đăng nhập
quản lý token nếu có dùng Cognito/JWT sau này
```

Cấu trúc gợi ý:

```txt
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── hooks/
│   └── useAuth.ts
├── services/
│   └── authApi.ts
├── utils/
│   └── authStorage.ts
└── types.ts
```

Ý nghĩa:

```txt
components/LoginForm.tsx       form đăng nhập
components/RegisterForm.tsx    form đăng ký
hooks/useAuth.ts               quản lý user hiện tại, login/logout
services/authApi.ts            gọi API auth nếu backend có auth
utils/authStorage.ts           lưu/lấy token hoặc userId từ localStorage
types.ts                       type User, LoginRequest, RegisterRequest
```

Giai đoạn MVP có thể chưa cần auth thật. Có thể dùng tạm:

```txt
DEMO_USER_ID = "demo-user-1"
```

---

## 3.2 `features/jobs/`

Dùng cho chức năng tìm kiếm và hiển thị job.

Mục đích:

```txt
gọi API lấy danh sách job
tìm kiếm job theo keyword
hiển thị danh sách job
hiển thị chi tiết job
chọn job để matching CV
```

Cấu trúc gợi ý:

```txt
src/features/jobs/
├── components/
│   ├── JobCard.tsx
│   ├── JobList.tsx
│   ├── JobSearchBar.tsx
│   └── JobDetail.tsx
├── hooks/
│   └── useJobs.ts
├── services/
│   └── jobApi.ts
├── utils/
│   └── formatJob.ts
└── types.ts
```

Ý nghĩa:

```txt
components/JobCard.tsx       hiển thị 1 job
components/JobList.tsx       hiển thị danh sách job
components/JobSearchBar.tsx  ô nhập keyword tìm kiếm job
components/JobDetail.tsx     hiển thị thông tin chi tiết job
hooks/useJobs.ts             quản lý state loading, error, jobs, search keyword
services/jobApi.ts           gọi API GET /jobs/search
utils/formatJob.ts           xử lý format salary, location, company nếu cần
types.ts                     type Job, JobSearchParams, JobSearchResponse
```

Luồng frontend cho jobs:

```txt
src/app/jobs/page.tsx
→ features/jobs/hooks/useJobs.ts
→ features/jobs/services/jobApi.ts
→ backend GET /jobs/search
→ components/JobList.tsx
→ components/JobCard.tsx
```

---

# 4. `src/lib/`

Thư mục `lib/` chứa code dùng chung toàn frontend nhưng không thuộc riêng feature nào.

Ví dụ:

```txt
src/lib/
├── apiClient.ts
├── constants.ts
├── helpers.ts
└── formatDate.ts
```

Mục đích:

```txt
cấu hình client gọi API
lưu constant dùng chung
hàm helper dùng nhiều nơi
hàm format ngày tháng, chuỗi, số
```

Ví dụ nên đặt ở đây:

```txt
API_BASE_URL
DEMO_USER_ID
apiClient
formatDate()
truncateText()
cn() để nối className nếu dùng Tailwind
```

Không nên đặt logic riêng của jobs/favorites/cv/matching trong `lib/`.

Ví dụ:

```txt
formatDate.ts       → lib/
formatJob.ts        → features/jobs/utils/
formatScore.ts      → features/matching/utils/
```

---

# 5. `src/types/`

Thư mục `types/` chứa type/interface dùng chung toàn frontend.

Ví dụ:

```txt
src/types/
├── api.ts
├── user.ts
├── common.ts
└── pagination.ts
```

Mục đích:

```txt
định nghĩa kiểu dữ liệu dùng nhiều nơi
giúp TypeScript kiểm tra lỗi
giúp code dễ autocomplete
```

Quy tắc:

```txt
Type dùng nhiều feature → src/types/
Type chỉ dùng trong 1 feature → src/features/<feature>/types.ts
```

Ví dụ:

```txt
User                 → src/types/user.ts
ApiResponse<T>       → src/types/api.ts
Job                  → src/features/jobs/types.ts hoặc src/types/job.ts nếu dùng nhiều nơi
MatchingResult       → src/features/matching/types.ts
```

---

# 6. Backend

Thư mục `backend/` chứa toàn bộ phần API serverless.

Cấu trúc chính:

```txt
backend/
├── config/
├── events/
└── src/
    ├── functions/
    ├── services/
    ├── repositories/
    ├── utils/
    └── types/
```

Backend dùng để:

```txt
nhận request từ frontend
xử lý nghiệp vụ
gọi SerpApi
đọc/ghi DynamoDB
trả dữ liệu cho frontend
deploy lên AWS Lambda/API Gateway
```

---

## 6.1 `backend/config/`

Chứa các file cấu hình dùng cho backend hoặc deploy.

Mục đích:

```txt
gom các setting dùng cho môi trường local/dev
lưu cấu hình phụ trợ nếu nhóm cần tách riêng
```

Lưu ý:

```txt
Nếu cấu hình được import trực tiếp trong code runtime, có thể đặt trong src/config/
Nếu cấu hình chỉ phục vụ tool/deploy, có thể đặt ở backend/config/
```

---

## 6.2 `backend/events/`

Chứa các file JSON giả lập request để test Lambda local.

Ví dụ:

```txt
events/
├── searchJobs.json
├── saveFavoriteJob.json
└── analyzeCvAndJob.json
```

Mục đích:

```txt
test Lambda không cần frontend
test nhanh body/query/path params
giúp backend debug từng function riêng lẻ
```

Ví dụ dùng:

```bash
serverless invoke local -f searchJobs -p events/searchJobs.json
```

---

## 6.3 `backend/src/`

Chứa toàn bộ source code chính của backend.

```txt
src/
├── functions/
├── services/
├── repositories/
├── utils/
└── types/
```

Luồng xử lý chuẩn:

```txt
functions/
→ services/
→ repositories/
→ DynamoDB
```

---

## 6.4 `src/functions/`

Chứa Lambda handler.

Mỗi handler thường tương ứng với một API endpoint hoặc một background job.

Cấu trúc:

```txt
src/functions/
├── jobs/
├── favorites/
├── cv/
└── matching/
```

Mục đích:

```txt
nhận event từ API Gateway hoặc EventBridge
đọc path params, query params, body
validate dữ liệu đầu vào ở mức cơ bản
gọi service để xử lý logic
trả response về frontend
```

Không nên đặt logic nghiệp vụ dài trong `functions/`.

Ví dụ không nên:

```txt
searchJobs.ts vừa gọi SerpApi, vừa lọc dữ liệu, vừa ghi DynamoDB
```

Nên tách:

```txt
searchJobs.ts
→ jobService.ts
→ jobRepository.ts
```

Các nhóm function chính:

```txt
functions/jobs/        API liên quan đến job
functions/favorites/   API liên quan đến job yêu thích
functions/cv/          API liên quan đến CV
functions/matching/    API liên quan đến matching
```

---

## 6.5 `functions/jobs/`

Dùng cho các Lambda liên quan đến job.

Ví dụ:

```txt
src/functions/jobs/
├── searchJobs.ts
└── fetchJobs.ts
```

Mục đích:

```txt
searchJobs.ts    nhận request tìm job từ frontend
fetchJobs.ts     job chạy nền để lấy dữ liệu từ SerpApi và lưu vào DynamoDB
```

Luồng `searchJobs`:

```txt
GET /jobs/search
→ functions/jobs/searchJobs.ts
→ services/jobService.ts
→ repositories/jobRepository.ts
```

Luồng `fetchJobs`:

```txt
EventBridge schedule hoặc invoke local
→ functions/jobs/fetchJobs.ts
→ services/jobService.ts
→ services/serpapiService.ts
→ repositories/jobRepository.ts
```

---

## 6.9 `src/services/`

Chứa business logic của backend.

Ví dụ:

```txt
src/services/
├── jobService.ts
├── serpapiService.ts
├── favoriteJobService.ts
├── cvService.ts
└── matchingService.ts
```

Mục đích:

```txt
xử lý nghiệp vụ chính
phối hợp nhiều repository/service nếu cần
gọi API bên ngoài như SerpApi
chuẩn hóa dữ liệu trước khi lưu
```

Vai trò từng service:

```txt
jobService.ts             xử lý logic tìm/lưu job
serpapiService.ts         gọi SerpApi Google Jobs API
favoriteJobService.ts     xử lý logic lưu/xem favorite job
cvService.ts              xử lý logic liên quan đến CV
matchingService.ts        xử lý logic tính điểm matching
```

Service không nên trả response HTTP trực tiếp. Response HTTP nên do `functions/` xử lý.

---

## 6.10 `src/repositories/`

Chứa code đọc/ghi DynamoDB.

Ví dụ:

```txt
src/repositories/
├── dynamoClient.ts
├── jobRepository.ts
├── favoriteJobRepository.ts
├── cvRepository.ts
└── matchingRepository.ts
```

Mục đích:

```txt
khởi tạo DynamoDB client
lưu dữ liệu vào bảng
đọc dữ liệu từ bảng
query theo key hoặc GSI
ẩn chi tiết DynamoDB khỏi service
```

Vai trò từng repository:

```txt
dynamoClient.ts              tạo DynamoDB DocumentClient
jobRepository.ts             thao tác với JobsTable
favoriteJobRepository.ts     thao tác với FavoritesTable
cvRepository.ts              thao tác với CVsTable
matchingRepository.ts        thao tác với MatchingTable
```

Repository không nên xử lý logic nghiệp vụ như tính score, kiểm tra độ phù hợp, gọi SerpApi.

---

## 6.11 `src/utils/`

Chứa helper dùng chung trong backend.

Ví dụ:

```txt
src/utils/
├── response.ts
├── errorHandler.ts
└── normalizeJob.ts
```

Mục đích:

```txt
response.ts       tạo response chuẩn cho API Gateway
errorHandler.ts   xử lý lỗi chung
normalizeJob.ts   chuẩn hóa dữ liệu job từ SerpApi
```

Nên đặt ở đây những hàm:

```txt
dùng lại ở nhiều function/service
không phụ thuộc riêng vào một feature
không thao tác trực tiếp database
```

Nếu helper chỉ dùng riêng cho matching thì nên đặt trong `matchingService.ts` hoặc `features/matching/utils` ở frontend.

---

## 6.12 `src/types/`

Chứa type/interface dùng chung trong backend.

Ví dụ:

```txt
src/types/
├── job.ts
├── favorite.ts
├── cv.ts
└── matching.ts
```

Mục đích:

```txt
định nghĩa shape dữ liệu
giúp service và repository dùng chung type
giảm lỗi khi truyền object giữa các tầng
```

Ví dụ:

```txt
Job
FavoriteJob
CV
MatchingResult
ApiResponse
```

Quy tắc:

```txt
Type liên quan đến Job → job.ts
Type liên quan đến CV → cv.ts
Type liên quan đến Matching → matching.ts
Type dùng chung → common.ts hoặc api.ts
```



# 10. Quy tắc đặt code đúng chỗ

## Không nên đặt logic gọi API backend trong page

Không nên:

```txt
src/app/jobs/page.tsx gọi fetch trực tiếp quá nhiều
```

Nên:

```txt
src/app/jobs/page.tsx
→ dùng useJobs()
→ useJobs gọi jobApi.ts
```

---

## Không nên đặt business logic trong Lambda handler

Không nên:

```txt
searchJobs.ts xử lý toàn bộ logic tìm job và thao tác DynamoDB
```

Nên:

```txt
searchJobs.ts
→ jobService.ts
→ jobRepository.ts
```

---

## Không nên để repository gọi API ngoài

Không nên:

```txt
jobRepository.ts gọi SerpApi
```

Nên:

```txt
serpapiService.ts gọi SerpApi
jobRepository.ts chỉ thao tác DynamoDB
```

---

## Không nên để component chứa quá nhiều logic

Không nên:

```txt
JobList.tsx vừa gọi API, vừa filter, vừa render, vừa xử lý loading/error phức tạp
```

Nên:

```txt
useJobs.ts xử lý logic
JobList.tsx chỉ render danh sách
```

---

# 11. Quy tắc đặt tên

```txt
searchJobs.ts
fetchJobs.ts
saveFavoriteJob.ts
getMatchingHistory.ts
jobService.ts
jobRepository.ts
```

---

# 12. Kết luận

Mục tiêu của cấu trúc này là để nhóm code theo nguyên tắc:

```txt
Frontend:
page → hook → service API → component render

Backend:
function handler → service → repository → DynamoDB
```

