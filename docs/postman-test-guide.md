# Hướng dẫn Kiểm thử bằng Postman (Postman Test Guide)

Tài liệu này hướng dẫn chi tiết cách thiết lập và sử dụng Postman để kiểm thử toàn bộ luồng chức năng của CV: từ Đăng ký, Đăng nhập (lấy token Cognito) cho đến Upload, Xem danh sách và Xóa CV.

---

## I. Chuẩn bị biến môi trường (Variables)

Để dễ dàng kiểm thử, hãy tạo một **Environment** hoặc cấu hình **Collection Variables** trong Postman với các biến sau:

| Tên biến | Ví dụ giá trị | Mô tả |
| :--- | :--- | :--- |
| `baseUrl` | `https://xxxxxx.execute-api.ap-southeast-1.amazonaws.com/dev` | URL của API Gateway (lấy từ stack Outputs) |
| `awsRegion` | `ap-southeast-1` | AWS Region nơi chứa Cognito User Pool |
| `clientId` | `xxxxxxxxxxxxxxxxxxxxxxxxxx` | App Client ID của Cognito (lấy từ stack Outputs) |
| `userPoolId` | `ap-southeast-1_xxxxxxxxx` | User Pool ID của Cognito (lấy từ stack Outputs) |
| `username` | `testuser@example.com` | Email đăng nhập của tài khoản test |
| `password` | `SecurePassword123!` | Mật khẩu tài khoản (phải thoả mãn password policy) |
| `idToken` | `eyJhbGciOi...` | Sẽ tự động cập nhật sau khi gọi API Đăng nhập thành công |

---

## II. Các bước thực hiện cuộc gọi API

### Bước 1: Đăng ký Tài khoản (Sign Up)
Chúng ta đăng ký tài khoản trực tiếp qua API Endpoint của Cognito.

- **Method**: `POST`
- **URL**: `https://cognito-idp.{{awsRegion}}.amazonaws.com/`
- **Headers**:
  - `Content-Type`: `application/x-amz-json-1.1`
  - `X-Amz-Target`: `AWSCognitoIdentityProviderService.SignUp`
- **Body** (dạng `raw` -> `JSON`):
```json
{
  "ClientId": "{{clientId}}",
  "Username": "{{username}}",
  "Password": "{{password}}",
  "UserAttributes": [
    {
      "Name": "email",
      "Value": "{{username}}"
    }
  ]
}
```
- **Hành động**: Nhấn **Send**. Nếu thành công, bạn sẽ nhận được thông tin User Sub cùng trạng thái chưa xác thực (`UserConfirmed: false`).

---

### Bước 2: Xác nhận tài khoản (Confirm Sign Up)
Vì tài khoản test không có email thật để nhận mã, chúng ta có 2 cách xác nhận:

#### Cách 1: Sử dụng AWS CLI (Khuyên dùng cho Dev)
Chạy lệnh này ở terminal của máy bạn:
```bash
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <userPoolId_của_bạn> \
  --username testuser@example.com \
  --region ap-southeast-1
```

#### Cách 2: Nếu có mã xác thực gửi về email thật
Nếu bạn cấu hình gửi email thật và nhận được mã gồm 6 số, gọi API sau trong Postman:
- **Method**: `POST`
- **URL**: `https://cognito-idp.{{awsRegion}}.amazonaws.com/`
- **Headers**:
  - `Content-Type`: `application/x-amz-json-1.1`
  - `X-Amz-Target`: `AWSCognitoIdentityProviderService.ConfirmSignUp`
- **Body** (dạng `raw` -> `JSON`):
```json
{
  "ClientId": "{{clientId}}",
  "Username": "{{username}}",
  "ConfirmationCode": "123456" 
}
```

---

### Bước 3: Đăng nhập & Tự động lưu Token (Log In)
Gửi yêu cầu đăng nhập lên Cognito để nhận JWT Token.

- **Method**: `POST`
- **URL**: `https://cognito-idp.{{awsRegion}}.amazonaws.com/`
- **Headers**:
  - `Content-Type`: `application/x-amz-json-1.1`
  - `X-Amz-Target`: `AWSCognitoIdentityProviderService.InitiateAuth`
- **Body** (dạng `raw` -> `JSON`):
```json
{
  "AuthFlow": "USER_PASSWORD_AUTH",
  "ClientId": "{{clientId}}",
  "AuthParameters": {
    "USERNAME": "{{username}}",
    "PASSWORD": "{{password}}"
  }
}
```

#### Mẹo tự động lưu Token vào biến trong Postman:
Chuyển qua tab **Tests** của request này trong Postman và dán đoạn code sau:
```javascript
var jsonData = pm.response.json();
if (jsonData.AuthenticationResult && jsonData.AuthenticationResult.IdToken) {
    // Tự động set biến idToken cho Collection
    pm.collectionVariables.set("idToken", jsonData.AuthenticationResult.IdToken);
    console.log("Đã cập nhật idToken tự động!");
}
```
Khi bạn nhấn **Send** thành công, biến `idToken` sẽ tự động được gán giá trị mới mà bạn không cần phải copy thủ công.

---

### Bước 4: Upload CV (`POST /cv/upload`)
Tải file PDF trực tiếp dưới dạng binary lên hệ thống.

- **Method**: `POST`
- **URL**: `{{baseUrl}}/cv/upload`
- **Headers**:
  - `Authorization`: `Bearer {{idToken}}`
  - `Content-Type`: `application/pdf`
  - `x-original-filename`: `NguyenVanA_Resume.pdf` (Tên hiển thị của file CV)
- **Body**: 
  - Chọn kiểu **binary**.
  - Nhấp vào nút **Select file** và chọn một file PDF hợp lệ có dung lượng dưới **5MB**.

- **Các trường hợp kiểm thử (Test Cases)**:
  1. **Thành công**: Chọn file PDF < 5mb, chưa từng upload. Trả về `201 Created` và URL file trên S3.
  2. **Lỗi định dạng**: Chọn file ảnh `.jpg` hoặc file `.txt` đổi đuôi thành `.pdf`. Trả về `400 Bad Request` với message `"Only PDF files are allowed"`.
  3. **Lỗi dung lượng**: Chọn file PDF dung lượng > 5MB. Trả về `400 Bad Request` với message `"File size exceeds 5MB limit"`.
  4. **Lỗi trùng lặp**: Upload lại chính file PDF đó thêm một lần nữa. Trả về `400 Bad Request` với message `"Duplicate CV content detected"`.
  5. **Lỗi quá số lượng**: Upload lần lượt 3 file PDF khác nhau. Đến file thứ 4 sẽ trả về `400 Bad Request` với message `"Maximum 3 CVs allowed per user"`.

---

### Bước 5: Xem danh sách CV (`GET /cv`)
Lấy danh sách các file CV đã upload cùng các thông tin chi tiết (dung lượng, mã băm, link S3 public).

- **Method**: `GET`
- **URL**: `{{baseUrl}}/cv`
- **Headers**:
  - `Authorization`: `Bearer {{idToken}}`
- **Body**: `none`

- **Kiểm tra kết quả**: Trạng thái trả về `200 OK`. Bạn sẽ thấy danh sách CV của tài khoản hiện tại. Hãy copy trường `key` hoặc tên file ở đuôi (ví dụ: `cv_1718873600000.pdf`) để thực hiện bước Xóa ở dưới.
- Bạn có thể copy trường `url` mở trên trình duyệt ẩn danh để test xem file PDF trực tuyến công khai.

---

### Bước 6: Xóa CV (`DELETE /cv/{filename}`)
Dọn dẹp CV cũ khi đã đạt giới hạn 3 file.

- **Method**: `DELETE`
- **URL**: `{{baseUrl}}/cv/{{filename}}` (Thay thế `{{filename}}` bằng phần tên file thực tế, ví dụ: `cv_1718873600000.pdf`)
- **Headers**:
  - `Authorization`: `Bearer {{idToken}}`
- **Body**: `none`

- **Kiểm tra kết quả**: Trạng thái trả về `200 OK` báo xóa thành công. Sau khi xóa, bạn có thể gọi lại `GET /cv` để kiểm tra số lượng giảm đi, và thử upload file mới để đảm bảo hạn mức hoạt động hoàn hảo.
