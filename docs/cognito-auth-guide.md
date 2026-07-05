# Cognito Auth Guide

Tài liệu này mô tả Cognito, gồm cấu hình backend bằng AWS SAM, cách test Cognito và ví dụ input/output cho các API auth.

## 1. Mục tiêu của phần Cognito

Phần Cognito được thêm vào project để xử lý xác thực người dùng:

- Đăng ký tài khoản bằng email/password
- Xác nhận email bằng mã code
- Đăng nhập
- Đăng xuất
- Lấy token để frontend gọi các API cần đăng nhập sau này
- Làm nền cho các tính năng như upload CV, save favorite job, matching history

Hiện tại phần này mới tập trung vào Cognito core + cấu hình frontend service, chưa gắn Cognito Authorizer vào API Gateway.

## 2. Những phần đã làm đến hiện tại

### 2.1. Thêm Cognito vào template.yaml

Đã thêm resource Cognito vào file:

```
backend/template.yaml
```

Các resource chính được thêm:

- AuthUserPool
- AuthUserPoolClient

Ý nghĩa:

| Resource | Mục đích |
| --- | --- |
| AuthUserPool | Quản lý user, đăng ký, đăng nhập, xác nhận email |
| AuthUserPoolClient | App Client để frontend Next.js kết nối với User Pool |

Cấu hình hiện tại:

- Login type: Email + password
- Email verification: Có
- MFA: Tắt
- Google login: Chưa làm
- App Client Secret: Không có
- Region: ap-southeast-1

Lưu ý: GenerateSecret được để false vì frontend chạy trên browser, không được dùng client secret.

### 2.2. Đặt Cognito đúng vị trí trong template

Cognito được thêm vào Resources của template.yaml theo hướng chỉ thêm resource mới, không sửa/xóa các resource cũ.

Mục tiêu là tránh ảnh hưởng đến các phần đang có như:

- RawJobsDLQ
- RawJobsQueue
- JobsTable
- FetchJobsFunction
- ProcessJobsFunction
- NormalizeAndMatchFunction

Cách làm này giúp commit Cognito an toàn hơn vì không đổi tên Logical ID hoặc cấu hình của resource cũ.

### 2.3. Thêm Outputs để frontend dùng

Đã thêm Outputs trong template.yaml để sau khi deploy có thể lấy thông tin cấu hình cho frontend.

Các output cần dùng:

- CognitoUserPoolId
- CognitoUserPoolClientId
- CognitoRegion

Frontend sẽ dùng các giá trị này để cấu hình Amplify/Cognito.

### 2.4. Lệnh kiểm tra và deploy an toàn bằng SAM

Các lệnh đã dùng hoặc cần dùng khi deploy:

```
aws sts get-caller-identity --profile nova
```

Dùng để kiểm tra đang deploy bằng đúng AWS profile nova.

```
cd backend
sam validate --profile nova --region ap-southeast-1
sam build
sam deploy --guided --profile nova --region ap-southeast-1
```

Khi deploy cần chú ý:

- Profile: nova
- Region: ap-southeast-1
- Stack: stack của project nhóm

Không dùng root account cá nhân để deploy resource nhóm.

**CƯƠNG ĐÃ DEPLOY RỒI NÊN AE K CẦN DEPLOY**

### 2.5. Test Cognito bằng AWS CLI

Sau khi deploy, đã test các flow Cognito bằng AWS CLI:

- Sign up
- Confirm sign up
- Login
- Refresh token
- Logout

Mục đích của bước này là kiểm tra Cognito hoạt động độc lập trước khi nối vào giao diện frontend.

### 2.6. Cấu hình .env.local cho frontend

Frontend cần file:

```
frontend/.env.local
```

Ví dụ:

```
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=<user_pool_id>
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=<app_client_id>
```

Lưu ý:

- Không commit .env.local lên GitHub.
- Chỉ nên commit .env.example.

Nên có file mẫu:

```
frontend/.env.example
```

Ví dụ:

```
NEXT_PUBLIC_AWS_REGION=ap-southeast-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
```

### 2.7. Thêm file cognitoAuthService.ts

Đã thêm file:

```
frontend/src/features/auth/services/cognitoAuthService.ts
```

Mục đích:

- Chứa các hàm gọi Cognito thông qua aws-amplify/auth
- Tách logic auth ra khỏi component UI
- Giữ đúng cấu trúc project: component gọi service, service xử lý auth

Các hàm chính:

- registerWithEmail(email, password)
- confirmRegister(email, code)
- loginWithEmail(email, password)
- logout()
- getAuthUser()
- getIdToken()

## 3. Ví dụ input/output API Cognito

Lưu ý: project không tự viết API auth trong backend. Frontend gọi trực tiếp Cognito thông qua aws-amplify/auth.

Các ví dụ dưới đây mô tả input/output ở tầng service frontend.

### 3.1. Register - registerWithEmail

Function

```
registerWithEmail(email, password)
```

Input

```
{
  "email": "user@example.com",
  "password": "Test@123456"
}
```

Output thành công

```
{
  "isSignUpComplete": false,
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "nextStep": {
    "signUpStep": "CONFIRM_SIGN_UP",
    "codeDeliveryDetails": {
      "deliveryMedium": "EMAIL",
      "destination": "u***@e***.com",
      "attributeName": "email"
    }
  }
}
```

Ý nghĩa

User đã đăng ký nhưng chưa dùng được ngay. Cognito đã gửi mã xác nhận về email. Cần gọi tiếp confirmRegister.

### 3.2. Confirm Register - confirmRegister

Function

```
confirmRegister(email, code)
```

Input

```
{
  "email": "user@example.com",
  "code": "123456"
}
```

Output thành công

```
{
  "isSignUpComplete": true,
  "nextStep": {
    "signUpStep": "DONE"
  }
}
```

Ý nghĩa

User đã xác nhận email thành công và có thể đăng nhập.

### 3.3. Login - loginWithEmail

Function

```
loginWithEmail(email, password)
```

Input

```
{
  "email": "user@example.com",
  "password": "Test@123456"
}
```

Output thành công

```
{
  "isSignedIn": true,
  "nextStep": {
    "signInStep": "DONE"
  }
}
```

Ý nghĩa

User đăng nhập thành công. Sau bước này frontend có thể gọi getIdToken() để lấy token.

### 3.4. Get ID Token - getIdToken

Function

```
getIdToken()
```

Input

```
{}
```

Output thành công

```
{
  "idToken": "eyJraWQiOiJ...token_rut_gon..."
}
```

Ý nghĩa

idToken sẽ được dùng để gọi các API cần đăng nhập sau này.

Ví dụ header:

```
Authorization: Bearer <id_token>
```

Lưu ý: Không log token thật lên console và không commit token vào GitHub.

### 3.5. Get Current User - getAuthUser

Function

```
getAuthUser()
```

Input

```
{}
```

Output thành công

```
{
  "username": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "userId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "signInDetails": {
    "loginId": "user@example.com"
  }
}
```

Ý nghĩa

Dùng để kiểm tra user hiện tại đang đăng nhập là ai.

### 3.6. Logout - logout

Function

```
logout()
```

Input

```
{}
```

Output thành công

```
{
  "success": true
}
```

Ý nghĩa

User đăng xuất khỏi phiên hiện tại.

## 4. Ví dụ test bằng AWS CLI

### 4.1. Sign up

```
aws cognito-idp sign-up \
  --client-id <app_client_id> \
  --username user@example.com \
  --password 'Test@123456' \
  --user-attributes Name=email,Value=user@example.com \
  --profile nova \
  --region ap-southeast-1
```

Output ví dụ:

```
{
  "UserConfirmed": false,
  "CodeDeliveryDetails": {
    "Destination": "u***@e***.com",
    "DeliveryMedium": "EMAIL",
    "AttributeName": "email"
  },
  "UserSub": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

### 4.2. Confirm sign up

```
aws cognito-idp confirm-sign-up \
  --client-id <app_client_id> \
  --username user@example.com \
  --confirmation-code 123456 \
  --profile nova \
  --region ap-southeast-1
```

Nếu thành công, CLI thường không trả body. Nghĩa là confirm thành công.

### 4.3. Login

```
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <app_client_id> \
  --auth-parameters USERNAME=user@example.com,PASSWORD='Test@123456' \
  --profile nova \
  --region ap-southeast-1
```

Output ví dụ:

```
{
  "AuthenticationResult": {
    "AccessToken": "eyJraWQiOiJ...access_token_rut_gon...",
    "ExpiresIn": 3600,
    "TokenType": "Bearer",
    "RefreshToken": "eyJjdHkiOiJ...refresh_token_rut_gon...",
    "IdToken": "eyJraWQiOiJ...id_token_rut_gon..."
  }
}
```

### 4.4. Refresh token

```
aws cognito-idp initiate-auth \
  --auth-flow REFRESH_TOKEN_AUTH \
  --client-id <app_client_id> \
  --auth-parameters REFRESH_TOKEN=<refresh_token> \
  --profile nova \
  --region ap-southeast-1
```

Output ví dụ:

```
{
  "AuthenticationResult": {
    "AccessToken": "eyJraWQiOiJ...new_access_token...",
    "ExpiresIn": 3600,
    "TokenType": "Bearer",
    "IdToken": "eyJraWQiOiJ...new_id_token..."
  }
}
```

## 6. Những phần chưa làm

Các phần chưa nằm trong scope hiện tại:

- Google Login
- Forgot Password
- Reset Password
- API Gateway Cognito Authorizer
- Protect frontend route
- Role-based authorization

Các phần này sẽ làm sau để tránh thay đổi quá nhiều trong một commit.

## 7. Checklist trước khi merge

- sam validate chạy thành công
- sam build chạy thành công
- Deploy Cognito thành công
- CLI sign-up thành công
- CLI confirm sign-up thành công
- CLI login thành công
- Có docs/cognito-auth-guide.md
- LoginForm/RegisterForm được sửa đúng flow nếu nằm trong PR

