# Google Login Setup Guide

## 1. Tổng quan

Project dùng Amazon Cognito User Pool cho authentication.

Google Login được triển khai thông qua Cognito Hosted UI/OAuth. Cognito đóng vai trò trung gian giữa frontend và Google Identity Provider.

Frontend dùng AWS Amplify để gọi Google sign-in redirect. Khi người dùng chọn đăng nhập Google, Amplify redirect sang Cognito Hosted UI, Cognito redirect sang Google, sau đó quay lại frontend callback route.

## 2. Cấu hình đã dùng

| Mục | Giá trị |
| --- | --- |
| AWS region | `ap-southeast-1` |
| Stack name | `jobs-matching-backend-dev` |
| Cognito domain prefix | `jobs-matching-auth-dev` |
| Frontend callback URL | `http://localhost:3000/auth/callback` |
| Frontend logout URL | `http://localhost:3000/login` |
| Post-login redirect | `/` |

## 3. Google Cloud Console setup

Tạo Google OAuth Client trong Google Cloud Console với cấu hình:

| Mục | Giá trị |
| --- | --- |
| Application type | `Web application` |
| Authorized JavaScript origins | `http://localhost:3000` |
| Authorized redirect URI | `https://jobs-matching-auth-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/idpresponse` |

Lưu ý quan trọng:

- Google redirect URI là URL của Cognito, không phải URL frontend.
- Redirect URI phải kết thúc bằng `/oauth2/idpresponse`.
- Không hard-code Google Client ID hoặc Google Client Secret trong frontend/backend source code.

## 4. Backend SAM configuration

Trong `backend/template.yaml`, Google Login được cấu hình qua các phần sau:

- `GoogleClientId` parameter để truyền Google OAuth Client ID khi deploy.
- `GoogleClientSecret` parameter với `NoEcho: true` để truyền Google OAuth Client Secret khi deploy.
- `CognitoDomainPrefix` parameter để cấu hình Hosted UI domain prefix.
- `AWS::Cognito::UserPoolDomain` để tạo Cognito Hosted UI domain.
- `AWS::Cognito::UserPoolIdentityProvider` để thêm Google làm Identity Provider cho User Pool.
- OAuth config trong `AuthUserPoolClient`, bao gồm:
  - `AllowedOAuthFlowsUserPoolClient: true`
  - `AllowedOAuthFlows: code`
  - `AllowedOAuthScopes: openid, email, profile`
  - `SupportedIdentityProviders: COGNITO, Google`
  - `CallbackURLs`
  - `LogoutURLs`
- Outputs cho Hosted UI domain, callback URL và logout URL.

Email/password login vẫn dùng Cognito User Pool App Client hiện tại. Các `ExplicitAuthFlows` hiện có không bị thay đổi.

## 5. Deploy backend

Chạy các lệnh từ thư mục `backend`:

```powershell
sam validate
sam build
sam deploy `
  --stack-name jobs-matching-backend-dev `
  --region ap-southeast-1 `
  --parameter-overrides `
    GoogleClientId="<GOOGLE_CLIENT_ID>" `
    GoogleClientSecret="<GOOGLE_CLIENT_SECRET>" `
    CognitoDomainPrefix="jobs-matching-auth-dev"
```

Lưu ý:

- Thay `<GOOGLE_CLIENT_ID>` và `<GOOGLE_CLIENT_SECRET>` bằng giá trị thật khi chạy local.
- Không đưa secret vào code, docs, commit hoặc pull request.
- Deploy bằng AWS profile `nova`.
- Region phải là `ap-southeast-1`.

## 6. Frontend environment variables

Trong `frontend/.env.local`, cần có:

```env
NEXT_PUBLIC_COGNITO_DOMAIN=jobs-matching-auth-dev.auth.ap-southeast-1.amazoncognito.com
NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_IN=http://localhost:3000/auth/callback
NEXT_PUBLIC_COGNITO_REDIRECT_SIGN_OUT=http://localhost:3000/login
```

Lưu ý:

- `NEXT_PUBLIC_COGNITO_DOMAIN` không có `https://`.
- Không commit `frontend/.env.local`.
- Nếu frontend chạy port khác `3000`, cần cập nhật cả Cognito App Client callback/logout URLs và Google Cloud Authorized JavaScript origins tương ứng.

## 7. Frontend flow

```text
/login
-> click "Đăng nhập với Google"
-> redirect sang Cognito Hosted UI / Google
-> Google xác thực thành công
-> Cognito redirect về /auth/callback
-> frontend kiểm tra session
-> redirect về /
```

Các phần frontend liên quan:

- `loginWithGoogle()` gọi Amplify `signInWithRedirect({ provider: "Google" })`.
- `/auth/callback` gọi auth service để kiểm tra session hiện tại.
- Nếu session hợp lệ, frontend redirect về `/`.
- Navbar đọc session/user hiện tại để hiển thị user và logout.

## 8. Test checklist

- [ ] `sam validate` pass.
- [ ] `sam build` pass.
- [ ] `sam deploy` pass.
- [ ] `npm run build` pass.
- [ ] Login bằng email/password vẫn hoạt động.
- [ ] Login bằng Google hoạt động.
- [ ] Sau Google login redirect về `/`.
- [ ] `/auth/callback` không crash khi lỗi.
- [ ] Logout vẫn hoạt động.

## 9. Troubleshooting

### `redirect_uri_mismatch`

Nguyên nhân thường gặp:

- Google Cloud redirect URI bị sai.
- Thiếu `/oauth2/idpresponse`.
- Dùng frontend callback URL thay vì Cognito redirect URI.

Giá trị đúng cho Google Cloud Authorized redirect URI:

```text
https://jobs-matching-auth-dev.auth.ap-southeast-1.amazoncognito.com/oauth2/idpresponse
```

### `invalid_client`

Nguyên nhân thường gặp:

- Google Client ID sai.
- Google Client Secret sai.
- Chưa deploy lại Cognito sau khi cập nhật Google Client ID/Secret.
- Deploy nhầm stack, nhầm region hoặc nhầm AWS profile.

Kiểm tra lại:

- Stack name: `jobs-matching-backend-dev`
- Region: `ap-southeast-1`
- AWS profile: `nova`

### Hosted UI domain conflict

Nguyên nhân:

- Cognito domain prefix `jobs-matching-auth-dev` đã có người dùng trong cùng region.

Cách xử lý:

- Chọn domain prefix khác.
- Cập nhật lại backend parameter `CognitoDomainPrefix`.
- Cập nhật lại frontend env `NEXT_PUBLIC_COGNITO_DOMAIN`.
- Cập nhật lại Google Cloud Authorized redirect URI.

### localhost port mismatch

Nguyên nhân:

- Frontend chạy port khác `3000`, nhưng Cognito callback/logout URLs chỉ cấu hình `localhost:3000`.

Cách xử lý:

- Chạy frontend bằng port `3000`, hoặc
- Cập nhật callback/logout URLs trong Cognito App Client và env frontend.

### env domain sai

Nguyên nhân:

- `NEXT_PUBLIC_COGNITO_DOMAIN` có `https://`.

Giá trị đúng:

```env
NEXT_PUBLIC_COGNITO_DOMAIN=jobs-matching-auth-dev.auth.ap-southeast-1.amazoncognito.com
```

Giá trị sai:

```env
NEXT_PUBLIC_COGNITO_DOMAIN=https://jobs-matching-auth-dev.auth.ap-southeast-1.amazoncognito.com
```
