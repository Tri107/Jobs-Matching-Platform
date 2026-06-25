# API Gateway Guide

Tài liệu này hướng dẫn cách sử dụng API Gateway trong backend của AI Job Matching Platform, cách test các endpoint hiện có, cách gọi API từ frontend, và cách tự thêm endpoint mới vào hệ thống.

## Mục lục

- [1. Mục tiêu của API Gateway](#1-mục-tiêu-của-api-gateway)
- [2. Cấu hình hiện tại](#2-cấu-hình-hiện-tại)
- [3. Endpoint hiện tại](#3-endpoint-hiện-tại)
- [4. Lấy ApiGatewayUrl sau khi deploy](#4-lấy-apigatewayurl-sau-khi-deploy)
- [5. Cách test endpoint /health](#5-cách-test-endpoint-health)
- [6. Cách test endpoint /jobs](#6-cách-test-endpoint-jobs)
- [6.1. Cách test endpoint /jobs/search](#61-cách-test-endpoint-jobssearch)
- [7. Public route và protected route](#7-public-route-và-protected-route)
- [7.1. Public route](#71-public-route)
- [7.2. Protected route](#72-protected-route)
- [8. JWT Authorizer là gì?](#8-jwt-authorizer-là-gì)
- [9. Vì sao lấy userId từ Cognito claims.sub?](#9-vì-sao-lấy-userid-từ-cognito-claimssub)
- [10. Cách lấy ID Token từ frontend](#10-cách-lấy-id-token-từ-frontend)
- [11. Cách tự thêm public endpoint mới](#11-cách-tự-thêm-public-endpoint-mới)
- [12. Cách tự thêm protected endpoint mới](#12-cách-tự-thêm-protected-endpoint-mới)
- [13. Contract đề xuất cho Favorites API](#13-contract-đề-xuất-cho-favorites-api)
- [13.1. POST /favorites](#131-post-favorites)
- [13.2. GET /favorites](#132-get-favorites)
- [13.3. DELETE /favorites/{jobId}](#133-delete-favoritesjobid)
- [14. FavouriteTable schema đề xuất](#14-favouritetable-schema-đề-xuất)
- [15. CORS](#15-cors)
- [16. Deploy sau khi thêm API mới](#16-deploy-sau-khi-thêm-api-mới)
- [17. Checklist khi thêm endpoint mới](#17-checklist-khi-thêm-endpoint-mới)
- [18. Lưu ý chi phí](#18-lưu-ý-chi-phí)
- [19. Commit convention](#19-commit-convention)

## 1. Mục tiêu của API Gateway

API Gateway là lớp tiếp nhận request HTTP từ frontend và điều phối request đó đến Lambda tương ứng.

Luồng tổng quát:

```text
Frontend Next.js
  ↓
API Gateway HTTP API
  ↓
Lambda Function
  ↓
DynamoDB / S3 / Textract / Bedrock
```

Trong project này, API Gateway dùng để:

- Tạo base URL cho backend API.
- Định tuyến request đến từng Lambda.
- Cho phép route public và route cần đăng nhập.
- Kết nối với Cognito JWT Authorizer để bảo vệ các API cần xác thực.
- Giúp frontend gọi backend qua HTTP endpoint thay vì gọi Lambda trực tiếp.

## 2. Cấu hình hiện tại

API Gateway được cấu hình trong:

```text
backend/template.yaml
```

Resource chính:

```yaml
BackendHttpApi:
  Type: AWS::Serverless::HttpApi
```

Tên API Gateway resource:

```text
BackendHttpApi
```

Tên Cognito JWT Authorizer:

```text
CognitoJwtAuthorizer
```

Output dùng cho frontend/backend team:

```text
ApiGatewayUrl
```

Stack hiện tại:

```text
jobs-matching-cuong-dev
```

Region:

```text
ap-southeast-1
```

AWS profile:

```text
nova
```

## 3. Endpoint hiện tại

Hiện tại API Gateway đã có các endpoint public sau:

| Method | Path | Auth | Mục đích |
| --- | --- | --- | --- |
| GET | /health | Không cần token | Kiểm tra API Gateway hoạt động |
| GET | /jobs | Không cần token | Lấy danh sách job từ JobsTable |

## 4. Lấy ApiGatewayUrl sau khi deploy

Sau khi Cương đã deploy backend bằng SAM, lấy API Gateway URL bằng lệnh:

```bash
aws cloudformation describe-stacks
  --stack-name jobs-matching-cuong-dev
  --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue"
  --output text
  --profile nova
  --region ap-southeast-1
```

Output:

```text
https://38ethw76uh.execute-api.ap-southeast-1.amazonaws.com/dev
```

Frontend có thể lưu URL này vào .env.local:

```env
NEXT_PUBLIC_API_BASE_URL=https://38ethw76uh.execute-api.ap-southeast-1.amazonaws.com/dev
```

Không commit .env.local lên GitHub.

## 5. Cách test endpoint /health

Endpoint:

```http
GET /health
```

Test bằng curl:

```bash
curl https://38ethw76uh.execute-api.ap-southeast-1.amazonaws.com/dev
```

Response thành công:

```json
{
  "message": "API Gateway is working",
  "service": "jobs-matching-backend",
  "stage": "dev",
  "timestamp": "2026-06-19T06:36:34.371Z"
}
```

Ý nghĩa:

- API Gateway đã deploy thành công.
- Route /health hoạt động.
- Lambda HealthCheckFunction đã được gọi thành công.

## 6. Cách test endpoint /jobs

Endpoint:

```http
GET /jobs
```

Ví dụ gọi API:

```bash
curl "https://38ethw76uh.execute-api.ap-southeast-1.amazonaws.com/dev/jobs?limit=10"
```

Response thành công:

```json
{
  "count": 2,
  "items": [
    {
      "jobId": "job-123",
      "title": "Frontend Developer",
      "companyName": "ABC Company",
      "location": "Ho Chi Minh City"
    },
    {
      "jobId": "job-456",
      "title": "Backend Developer",
      "companyName": "XYZ Company",
      "location": "Remote"
    }
  ]
}
```

Lưu ý:

- count là số lượng job trả về trong response.
- items là danh sách job.
- Query limit dùng để giới hạn số lượng item trả về.
- Hiện tại endpoint này phục vụ MVP/demo, chưa phải search/filter tối ưu hoàn chỉnh.

Ví dụ:

```http
GET /jobs?limit=10
```

## 6.1. Cách test endpoint /jobs/search

Endpoint GET /jobs/search dùng để phục vụ trang jobs/search/filter job.

Frontend có thể gọi endpoint này để tìm job theo keyword, location, scheduleType, postedAt và phân trang bằng nextToken.

Đây là public endpoint vì người dùng chưa đăng nhập vẫn nên xem và tìm kiếm job được.

Route:

| Method | Path | Auth |
| --- | --- | --- |
| GET | /jobs/search | Public, không cần token |

Query params:

| Param | Kiểu | Ví dụ | Ý nghĩa |
| --- | --- | --- | --- |
| keyword | string | react | Tìm trong title, originalTitle, companyName, location, scheduleType, description |
| location | string | Ho Chi Minh | Lọc theo location |
| scheduleType | string | Full-time | Lọc theo hình thức làm việc |
| postedAt | string | 2026-06-19 | Lọc theo postedAt |
| sort | enum | relevance | Sắp xếp kết quả |
| limit | number | 10 | Số job scan trong một page, default 10, max 50 |
| nextToken | string | base64-token | Token phân trang từ response trước |

Sort enum hiện hỗ trợ:

- relevance
- latest
- posted_at_asc

Ví dụ request hợp lệ:

```http
GET /jobs/search?limit=10
GET /jobs/search?keyword=react&limit=10
GET /jobs/search?keyword=react&location=Ho%20Chi%20Minh&scheduleType=Full-time&limit=10
GET /jobs/search?postedAt=2026-06-19&sort=latest&limit=10
GET /jobs/search?sort=posted_at_asc&limit=10
GET /jobs/search?nextToken=<nextToken>&limit=10
```

Response mẫu:

```json
{
  "count": 2,
  "items": [
    {
      "jobId": "job-123",
      "hash": "hash-value",
      "title": "Frontend Developer",
      "originalTitle": "Frontend Developer",
      "companyName": "ABC Company",
      "location": "Ho Chi Minh",
      "postedAt": "2026-06-19",
      "originalPostedAt": "1 day ago",
      "scheduleType": "Full-time",
      "sourceLink": "https://example.com/job",
      "description": "React developer job",
      "createdAt": "2026-06-19T10:00:00.000Z"
    }
  ],
  "nextToken": "base64-pagination-token",
  "filters": {
    "keyword": "react",
    "location": "Ho Chi Minh",
    "scheduleType": "Full-time",
    "limit": 10,
    "sort": "relevance"
  }
}
```

Nếu không còn trang tiếp theo thì response có thể không có nextToken.

Ví dụ frontend gọi API:

```ts
const params = new URLSearchParams({
  keyword: "react",
  location: "Ho Chi Minh",
  scheduleType: "Full-time",
  limit: "10",
});

const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/search?${params.toString()}`
);

const data = await response.json();
```

Không gửi Authorization header vì endpoint này public.

Test bằng curl:

```bash
curl "<ApiGatewayUrl>/jobs/search?limit=10"
curl "<ApiGatewayUrl>/jobs/search?keyword=react&limit=10"
curl "<ApiGatewayUrl>/jobs/search?location=Ho%20Chi%20Minh&limit=10"
curl "<ApiGatewayUrl>/jobs/search?scheduleType=Full-time&limit=10"
curl "<ApiGatewayUrl>/jobs/search?postedAt=2026-06-19&sort=latest&limit=10"
curl "<ApiGatewayUrl>/jobs/search?limit=10&nextToken=<nextToken>"
```

Lưu ý kỹ thuật:

- Đây là MVP search/filter trên JobsTable hiện có.
- Endpoint hiện dùng DynamoDB Scan có limit và filter/sort trong memory trên page dữ liệu đã scan.
- Vì filter diễn ra sau khi scan một page, response có thể trả ít hơn limit nhưng vẫn có nextToken.
- Đây chưa phải global search/filter toàn bảng.
- Nếu data tăng lớn, cần tối ưu sau bằng GSI, OpenSearch hoặc cơ chế indexing khác.
- Không nằm trong scope task này.

Cảnh báo chi phí:

Endpoint này dùng:

- API Gateway HTTP API
- Lambda
- DynamoDB read/scan
- CloudWatch Logs

DynamoDB Scan có thể tăng chi phí khi dữ liệu lớn hoặc frontend gọi API quá thường xuyên.

Không nên để frontend polling liên tục hoặc gọi API trong vòng lặp.

## 7. Public route và protected route

Trong project này có 2 loại route:

### 7.1. Public route

Public route là route không cần đăng nhập.

Ví dụ:

```http
GET /health
GET /jobs
```

Frontend có thể gọi trực tiếp, không cần gửi token.

Ví dụ:

```ts
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs?limit=10`);
const data = await response.json();
```

### 7.2. Protected route

Protected route là route bắt buộc user phải đăng nhập bằng Cognito.

Ví dụ đề xuất:

```http
POST /favorites
GET /favorites
DELETE /favorites/{jobId}
POST /cv/upload
POST /matching/evaluate
GET /matching/history
```

Frontend phải gửi JWT token trong header:

```http
Authorization: Bearer <id_token>
```

Ví dụ:

```ts
const token = await getIdToken();

const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Nếu không gửi token hoặc token không hợp lệ, API Gateway sẽ trả về lỗi 401 Unauthorized và Lambda sẽ không được gọi.

## 8. JWT Authorizer là gì?

JWT Authorizer là cơ chế xác thực request ở tầng API Gateway.

Trong project này:

```text
Frontend login bằng Cognito
  ↓
Cognito trả về ID Token
  ↓
Frontend gửi ID Token lên API Gateway
  ↓
API Gateway JWT Authorizer kiểm tra token
  ↓
Nếu token hợp lệ thì request mới được chuyển đến Lambda
```

JWT Authorizer kiểm tra:

- Token có hợp lệ không.
- Token có hết hạn chưa.
- Token có đúng issuer của Cognito User Pool không.
- Token có đúng audience/App Client không.

Lợi ích:

- Lambda không cần tự verify token thủ công.
- API bị chặn từ API Gateway nếu request không hợp lệ.
- Các protected API có thể dùng chung một cơ chế xác thực.

## 9. Vì sao lấy userId từ Cognito claims.sub?

Khi user đăng nhập thành công, Cognito tạo JWT token chứa các thông tin định danh của user. Trong đó, claim sub là ID duy nhất và ổn định của user trong Cognito User Pool.

Trong Lambda của protected route, có thể lấy userId như sau:

```ts
const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
```

Nên dùng claims.sub làm userId vì:

- sub là định danh duy nhất của user trong Cognito.
- sub ổn định hơn email.
- Email có thể thay đổi trong tương lai.
- Dùng sub giúp tránh lỗi trùng user.
- Phù hợp để làm partition key trong các bảng như Favorites, MatchingHistory, UserProfile.

Không nên lấy userId từ request body.

Không nên để frontend tự gửi:

```json
{
  "userId": "abc"
}
```

Lý do: frontend có thể bị chỉnh sửa request. Nếu backend tin vào userId từ body, user A có thể giả mạo request thành user B.

Cách đúng:

```text
userId phải lấy từ token đã được Cognito xác thực.
```

## 10. Cách lấy ID Token từ frontend

Frontend hiện dùng Cognito thông qua Amplify Auth.

Ví dụ service:

```ts
import { fetchAuthSession } from "aws-amplify/auth";

export async function getIdToken() {
  const session = await fetchAuthSession();
  return session.tokens?.idToken?.toString();
}
```

Khi gọi protected API:

```ts
const token = await getIdToken();

await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/favorites`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Lưu ý:

- Không log token thật lên console.
- Không commit token vào GitHub.
- Token có thời hạn sử dụng, hết hạn thì frontend cần refresh hoặc login lại.

## 11. Cách tự thêm public endpoint mới

Ví dụ cần thêm endpoint:

```http
GET /example
```

Bước 1: Tạo Lambda handler

Tạo file:

```text
backend/src/functions/example/getExample.ts
```

Ví dụ:

```ts
import { jsonResponse } from "../../utils/httpResponse";

export async function handler() {
  return jsonResponse(200, {
    message: "Example public API is working",
  });
}
```

Bước 2: Thêm Lambda vào template.yaml

```yaml
GetExampleFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: !Sub "${ProjectName}-get-example-${StageName}"
    CodeUri: .
    Handler: src/functions/example/getExample.handler
    Description: Public example endpoint
    Events:
      GetExampleApi:
        Type: HttpApi
        Properties:
          ApiId: !Ref BackendHttpApi
          Path: /example
          Method: GET
          PayloadFormatVersion: "2.0"
  Metadata:
    BuildMethod: esbuild
    BuildProperties:
      Minify: true
      Target: "es2020"
      Sourcemap: true
      EntryPoints:
        - src/functions/example/getExample.ts
```

Bước 3: Test

```bash
curl https://abc123.execute-api.ap-southeast-1.amazonaws.com/dev/example
```

## 12. Cách tự thêm protected endpoint mới

Ví dụ cần thêm endpoint:

```http
GET /profile
```

Route này cần user đăng nhập.

Bước 1: Tạo Lambda handler

Tạo file:

```text
backend/src/functions/profile/getProfile.ts
```

Ví dụ:

```ts
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { jsonResponse } from "../../utils/httpResponse";

export async function handler(event: APIGatewayProxyEventV2) {
  const userId = event.requestContext.authorizer?.jwt?.claims?.sub;

  if (!userId) {
    return jsonResponse(401, {
      message: "Unauthorized",
    });
  }

  return jsonResponse(200, {
    userId,
    message: "Protected profile API is working",
  });
}
```

Bước 2: Thêm Lambda protected route vào template.yaml

```yaml
GetProfileFunction:
  Type: AWS::Serverless::Function
  Properties:
    FunctionName: !Sub "${ProjectName}-get-profile-${StageName}"
    CodeUri: .
    Handler: src/functions/profile/getProfile.handler
    Description: Protected profile endpoint
    Events:
      GetProfileApi:
        Type: HttpApi
        Properties:
          ApiId: !Ref BackendHttpApi
          Path: /profile
          Method: GET
          PayloadFormatVersion: "2.0"
          Auth:
            Authorizer: CognitoJwtAuthorizer
  Metadata:
    BuildMethod: esbuild
    BuildProperties:
      Minify: true
      Target: "es2020"
      Sourcemap: true
      EntryPoints:
        - src/functions/profile/getProfile.ts
```

Điểm quan trọng:

```yaml
Auth:
  Authorizer: CognitoJwtAuthorizer
```

Dòng này giúp route trở thành protected route.

Nếu không có dòng này, route sẽ là public route.

Bước 3: Test không token

```bash
curl https://abc123.execute-api.ap-southeast-1.amazonaws.com/dev/profile
```

Kết quả mong đợi:

```text
401 Unauthorized
```

Bước 4: Test có token

```bash
curl https://abc123.execute-api.ap-southeast-1.amazonaws.com/dev/profile \
  -H "Authorization: Bearer <id_token>"
```

Kết quả mong đợi:

```json
{
  "userId": "cognito-sub-id",
  "message": "Protected profile API is working"
}
```

## 13. Contract đề xuất cho Favorites API

Favorites API nên là protected API vì dữ liệu wishlist thuộc về từng user.

Route đề xuất:

| Method | Path | Auth | Mục đích |
| --- | --- | --- | --- |
| POST | /favorites | Cần token | Lưu job vào wishlist |
| GET | /favorites | Cần token | Lấy danh sách job user đã lưu |
| DELETE | /favorites/{jobId} | Cần token | Bỏ job khỏi wishlist |

### 13.1. POST /favorites

Request:

```http
POST /favorites
Authorization: Bearer <id_token>
Content-Type: application/json
```

Body:

```json
{
  "jobId": "job-123"
}
```

Backend nên lấy userId từ Cognito claims:

```ts
const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
```

Không nên lấy userId từ body.

Response đề xuất:

```json
{
  "message": "Favorite job saved",
  "data": {
    "userId": "cognito-sub-id",
    "jobId": "job-123",
    "createdAt": "2026-06-19T10:00:00.000Z"
  }
}
```

### 13.2. GET /favorites

Request:

```http
GET /favorites
Authorization: Bearer <id_token>
```

Backend lấy userId từ token, sau đó query favorites theo user hiện tại.

Response đề xuất:

```json
{
  "count": 2,
  "items": [
    {
      "userId": "cognito-sub-id",
      "jobId": "job-123",
      "createdAt": "2026-06-19T10:00:00.000Z"
    },
    {
      "userId": "cognito-sub-id",
      "jobId": "job-456",
      "createdAt": "2026-06-19T10:05:00.000Z"
    }
  ]
}
```

### 13.3. DELETE /favorites/{jobId}

Request:

```http
DELETE /favorites/job-123
Authorization: Bearer <id_token>
```

Backend lấy:

```ts
const userId = event.requestContext.authorizer?.jwt?.claims?.sub;
const jobId = event.pathParameters?.jobId;
```

Response đề xuất:

```json
{
  "message": "Favorite job removed",
  "data": {
    "userId": "cognito-sub-id",
    "jobId": "job-123"
  }
}
```

## 14. FavouriteTable schema đề xuất

Schema có thể tùy chỉnh theo task, nhưng với wishlist cơ bản nên dùng:

```text
Partition key: userId
Sort key: jobId
```

Lý do:

- Một user có thể lưu nhiều job.
- Một job có thể được nhiều user lưu.
- GET /favorites có thể query nhanh theo userId.
- DELETE /favorites/{jobId} có thể xóa chính xác item theo userId + jobId.

Item mẫu:

```json
{
  "userId": "cognito-sub-id",
  "jobId": "job-123",
  "createdAt": "2026-06-19T10:00:00.000Z"
}
```

Nếu cần hiển thị đầy đủ thông tin job trong wishlist, backend có thể:

1. Query FavouriteTable theo userId.
2. Lấy danh sách jobId.
3. Batch get hoặc query JobsTable để lấy thông tin job tương ứng.

## 15. CORS

API Gateway hiện cấu hình CORS cho frontend local:

```text
http://localhost:3000
```

Các header cần thiết:

```http
Content-Type
Authorization
```

Các method cần thiết:

```http
GET
POST
DELETE
OPTIONS
```

Nếu frontend đổi port, ví dụ Next.js chạy ở:

```text
http://localhost:3001
```

thì cần thêm origin này vào CorsConfiguration.AllowOrigins.

## 16. Deploy sau khi thêm API mới

Trong thư mục backend:

```bash
cd backend
sam validate --lint
sam build
sam deploy --profile nova --region ap-southeast-1
```

Nếu sam validate --lint lỗi do môi trường lint, có thể kiểm tra cú pháp cơ bản bằng:

```bash
sam validate
```

Sau khi deploy, kiểm tra output:

```bash
aws cloudformation describe-stacks
  --stack-name jobs-matching-cuong-dev
  --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue"
  --output text
  --profile nova
  --region ap-southeast-1
```

## 17. Checklist khi thêm endpoint mới

Trước khi commit/deploy, kiểm tra:

- Đã tạo Lambda handler đúng vị trí trong backend/src/functions.
- Đã khai báo Lambda trong template.yaml.
- Route đã trỏ đúng ApiId: !Ref BackendHttpApi.
- Public route không gắn Auth.
- Protected route có:

```yaml
Auth:
  Authorizer: CognitoJwtAuthorizer
```

- Lambda có đủ IAM policy nếu cần đọc/ghi DynamoDB, S3, Textract, Bedrock.
- Lambda có đủ environment variables nếu cần table name, bucket name, function name.
- Đã thêm Metadata.BuildProperties.EntryPoints.
- Đã chạy sam validate.
- Đã chạy sam build.
- Đã test bằng curl/Postman.
- Đã cập nhật docs nếu endpoint dùng chung cho frontend/team.

## 18. Lưu ý chi phí

Các resource có thể phát sinh chi phí:

- API Gateway HTTP API: tính theo số request.
- Lambda: tính theo số lần invoke và thời gian chạy.
- DynamoDB: tính theo read/write request nếu dùng PAY_PER_REQUEST.
- CloudWatch Logs: tính theo lượng log lưu trữ.
- S3/Textract/Bedrock: có thể phát sinh chi phí cao hơn nếu endpoint liên quan CV upload hoặc AI matching.

Không nên để frontend gọi API liên tục trong vòng lặp hoặc polling quá dày.

## 19. Commit convention

Khi thêm API mới:

```bash
git checkout develop
git pull origin develop
git checkout -b feat/<api-name>
```

Ví dụ:

```bash
git checkout -b feat/favorites-api
```

Commit code:

```bash
git commit -m "feat(api): add favorites endpoints"
```

Commit docs:

```bash
git commit -m "docs(api): update api gateway guide"
```
