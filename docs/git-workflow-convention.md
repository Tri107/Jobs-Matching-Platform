# Git Workflow Convention

## 1. Branch Naming Convention

Cú pháp:

<type>/<short-description>

Ví dụ:

feat/user-authentication

feat/job-search-api

fix/login-validation

refactor/job-service

docs/update-readme

chore/migrate-backend-to-aws-sam

### Ý nghĩa

feat/  
→ Phát triển tính năng mới

fix/  
→ Sửa lỗi

refactor/  
→ Cải thiện cấu trúc code nhưng không thay đổi logic

docs/  
→ Cập nhật tài liệu

chore/  
→ Setup, cấu hình, cài đặt thư viện, CI/CD, Docker, AWS SAM,...

### Quy tắc đặt tên

- Viết thường toàn bộ.
- Dùng dấu "-" thay cho khoảng trắng.
- Tên ngắn gọn, mô tả đúng mục đích.
- Mỗi task nên tạo một branch riêng.
- Không commit trực tiếp lên main/develop.

Ví dụ đúng:

feat/upload-cv

feat/job-matching

fix/search-pagination

chore/setup-cognito

Ví dụ sai:

newFeature

fixBug

cuong_branch

test123

## 2. Commit Convention

Cú pháp:

type(scope): message

Ví dụ:

feat(auth): add user login api

fix(search): fix pagination issue

docs(readme): update installation guide

refactor(job): simplify matching service

chore(backend): setup aws sam template

### Ý nghĩa

feat:
→ Thêm tính năng mới

fix:
→ Sửa lỗi

docs:
→ Cập nhật tài liệu

refactor:
→ Cải thiện code nhưng không đổi logic

chore:
→ Setup, cấu hình, cài đặt package, CI/CD, AWS,...

### Quy tắc commit

- Commit nhỏ, đúng 1 mục đích.
- Không commit nhiều tính năng trong cùng một commit.
- Message ngắn gọn, mô tả rõ thay đổi.
- Dùng tiếng Anh để đồng bộ với tài liệu kỹ thuật.

Ví dụ tốt:

feat(job): add search jobs endpoint

fix(auth): validate empty password

docs(api): update swagger docs

Ví dụ không nên dùng:

update

fix bug

done

code