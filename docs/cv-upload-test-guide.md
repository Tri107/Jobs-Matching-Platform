# Hướng dẫn Kiểm thử Thủ công (Manual Test Guide) cho Chức năng CV

Tài liệu này hướng dẫn chi tiết cách kiểm thử thủ công chức năng Upload CV và kiểm tra số lượng CV của từng User từ lúc đăng ký, đăng nhập hệ thống đến khi gọi API.

## I. Chuẩn bị (Prerequisites)

Để thực hiện kiểm thử, bạn cần có các thông tin sau sau khi backend đã được deploy thành công:
1. **ApiGatewayUrl**: Endpoint base URL của API Gateway (ví dụ: `https://38ethw76uh.execute-api.ap-southeast-1.amazonaws.com/dev`).
2. **CognitoUserPoolId**: ID của Cognito User Pool (ví dụ: `ap-southeast-1_xxxxxxxxx`).
3. **CognitoUserPoolClientId**: App Client ID của Cognito (ví dụ: `xxxxxxxxxxxxxxxxxxxxxxxxxx`).
4. **AWS Region**: Region nơi deploy (ví dụ: `ap-southeast-1`).

Bạn có thể lấy các thông tin này bằng cách kiểm tra phần `Outputs` của AWS CloudFormation stack sau khi deploy.

---

## II. Quy trình Đăng ký & Đăng nhập bằng Cognito

Chúng ta có thể sử dụng AWS CLI hoặc Postman để giả lập các bước này.

### Bước 1: Đăng ký User mới (Sign Up)

Sử dụng lệnh AWS CLI sau để tạo một tài khoản test:

```bash
aws cognito-idp sign-up \
  --client-id <CognitoUserPoolClientId> \
  --username test-cv-user@example.com \
  --password "SecurePassword123!" \
  --region ap-southeast-1
```

### Bước 2: Xác thực User (Admin Confirm)

Trong môi trường phát triển (dev), chúng ta có thể kích hoạt tài khoản trực tiếp mà không cần nhận mã xác thực qua email:

```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <CognitoUserPoolId> \
  --username test-cv-user@example.com \
  --region ap-southeast-1
```

### Bước 3: Đăng nhập để lấy ID Token (Login)

Gửi yêu cầu đăng nhập để nhận JWT Token:

```bash
aws cognito-idp initiate-auth \
  --client-id <CognitoUserPoolClientId> \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=test-cv-user@example.com,PASSWORD="SecurePassword123!" \
  --region ap-southeast-1
```

**Response mong đợi**:
Trong JSON trả về, hãy lưu lại chuỗi token nằm trong trường `AuthenticationResult.IdToken`. Chuỗi này sẽ được sử dụng làm Bearer Token trong header `Authorization` khi gọi các API bảo mật.

---

## III. Kiểm thử các chức năng CV bằng curl hoặc Postman

### 1. Upload CV (`POST /cv/upload`)

API này yêu cầu client gửi file PDF dưới dạng **binary payload** trực tiếp trong request body.

- **URL**: `<ApiGatewayUrl>/cv/upload`
- **Method**: `POST`
- **Headers**:
  - `Authorization`: `Bearer <ID_Token_đã_lấy_ở_bước_3>`
  - `Content-Type`: `application/pdf`
  - `x-original-filename`: `NguyenVanA_Resume.pdf` (Không bắt buộc, dùng để lưu tên file gốc)
- **Body**: Chọn truyền dữ liệu dạng Binary (chọn file PDF dưới 5MB).

#### Ví dụ gọi bằng curl:
```bash
curl -X POST "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/cv/upload" \
  -H "Authorization: Bearer <ID_Token>" \
  -H "Content-Type: application/pdf" \
  -H "x-original-filename: candidate_resume.pdf" \
  --data-binary "@path/to/my_resume.pdf"
```

#### Response thành công (201 Created):
```json
{
  "message": "CV uploaded successfully",
  "data": {
    "key": "us-east-1:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/cv_1718873600000.pdf",
    "url": "https://jobs-matching-cvs-dev-xxxxxxxxx.s3.ap-southeast-1.amazonaws.com/us-east-1%3Axxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/cv_1718873600000.pdf",
    "originalFilename": "candidate_resume.pdf",
    "sizeBytes": 1048576,
    "uploadedAt": "2026-06-20T03:30:00.000Z"
  }
}
```

---

### 2. Xem Danh sách CV (`GET /cv`)

Lấy toàn bộ danh sách các CV hiện có của user đang đăng nhập.

- **URL**: `<ApiGatewayUrl>/cv`
- **Method**: `GET`
- **Headers**:
  - `Authorization`: `Bearer <ID_Token>`

#### Ví dụ gọi bằng curl:
```bash
curl -X GET "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/cv" \
  -H "Authorization: Bearer <ID_Token>"
```

#### Response thành công (200 OK):
```json
{
  "count": 1,
  "items": [
    {
      "key": "us-east-1:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/cv_1718873600000.pdf",
      "filename": "candidate_resume.pdf",
      "sizeBytes": 1048576,
      "lastModified": "2026-06-20T03:30:00.000Z",
      "url": "https://jobs-matching-cvs-dev-xxxxxxxxx.s3.ap-southeast-1.amazonaws.com/us-east-1%3Axxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/cv_1718873600000.pdf",
      "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    }
  ]
}
```

---

### 3. Xóa CV (`DELETE /cv/{filename}`)

Xóa một CV cụ thể của user. `{filename}` tương ứng với phần tên file trong key S3 (ví dụ: `cv_1718873600000.pdf`).

- **URL**: `<ApiGatewayUrl>/cv/{filename}`
- **Method**: `DELETE`
- **Headers**:
  - `Authorization`: `Bearer <ID_Token>`

#### Ví dụ gọi bằng curl:
```bash
curl -X DELETE "https://<api-id>.execute-api.ap-southeast-1.amazonaws.com/dev/cv/cv_1718873600000.pdf" \
  -H "Authorization: Bearer <ID_Token>"
```

#### Response thành công (200 OK):
```json
{
  "message": "CV deleted successfully",
  "deletedKey": "us-east-1:xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/cv_1718873600000.pdf"
}
```

---

## IV. Kiểm thử các Biên Kịch bản Lỗi (Edge Cases Validation)

Hãy chạy các ca kiểm thử sau để đảm bảo logic nghiệp vụ hoạt động chính xác:

### 1. Kiểm tra Định dạng File (Không phải PDF)
- **Hành động**: Thử upload một file text hoặc ảnh (ví dụ: đổi đuôi `.txt` thành `.pdf` nhưng nội dung vẫn là text).
- **Kết quả mong đợi**: Lambda kiểm tra magic bytes đầu file và từ chối. Trả về `400 Bad Request` với message: `"Only PDF files are allowed"`.

### 2. Kiểm tra Dung lượng File (> 5MB)
- **Hành động**: Upload một file PDF có dung lượng lớn hơn 5MB (ví dụ: 6MB).
- **Kết quả mong đợi**: Trả về `400 Bad Request` với message: `"File size exceeds 5MB limit"`.

### 3. Kiểm tra Trùng lặp Nội dung File (Duplicate Hashing)
- **Hành động**:
  1. Upload một file `cv_a.pdf` thành công.
  2. Tiếp tục upload lại chính file `cv_a.pdf` đó (dù có đổi tên header `x-original-filename` hay không).
- **Kết quả mong đợi**: Hệ thống băm nội dung file ra mã SHA-256 và so sánh với file đã tồn tại của user. Trả về `400 Bad Request` với message: `"Duplicate CV content detected"`.

### 4. Kiểm tra Giới hạn số lượng (Max 3 files)
- **Hành động**:
  1. Upload thành công 3 file PDF khác nhau về nội dung.
  2. Cố gắng upload tiếp file thứ 4.
- **Kết quả mong đợi**: API kiểm tra qua S3 ListObjectsV2 thấy đã có 3 file. Trả về `400 Bad Request` với message: `"Maximum 3 CVs allowed per user"`.

### 5. Kiểm tra Xem Trực tuyến Public URL
- **Hành động**: Lấy trường `url` trong response upload thành công và mở trực tiếp bằng trình duyệt ẩn danh (không có header Authorization).
- **Kết quả mong đợi**: File PDF được hiển thị trực tuyến thành công nhờ cấu hình public S3 bucket.
