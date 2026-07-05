sam # Backend Deploy Guide

Hướng dẫn build và deploy backend bằng AWS SAM.

## 1. Di chuyển vào thư mục backend

```bash
cd backend
```

## 2. Cài thư viện

```bash
npm install
```

## 3. Kiểm tra template

```bash
sam validate --lint
```

Lệnh này dùng để kiểm tra file `template.yaml` có đúng cú pháp SAM/CloudFormation không.

## 4. Build project

```bash
sam build
```

Sau khi build thành công, SAM sẽ tạo thư mục:

```txt
.aws-sam/
```

## 5. Deploy lần đầu

```bash
sam deploy --guided
```

Khi được hỏi, nhập theo gợi ý sau:

```txt
Stack Name: jobs-matching-backend-dev
AWS Region: ap-southeast-1
Parameter StageName: dev
Parameter ProjectName: jobs-matching
Parameter SerpApiKey: [ENCRYPTION_KEY]
Confirm changes before deploy: Y
Allow SAM CLI IAM role creation: Y
Disable rollback: N
Save arguments to configuration file: Y
SAM configuration file: samconfig.toml
SAM configuration environment: default
```

Sau đó SAM sẽ tạo các resource trên AWS như:

```txt
Lambda
SQS
DynamoDB
IAM Role
CloudWatch Logs
```

## 6. Deploy các lần sau

Sau lần deploy đầu tiên, chỉ cần chạy:

```bash
sam build
sam deploy
```

Không cần dùng lại `--guided` nếu file `samconfig.toml` đã được tạo.

## 7. Kiểm tra sau khi deploy

Vào AWS Console và kiểm tra:

```txt
CloudFormation → Stacks → jobs-matching-backend-dev
Lambda → Functions
SQS → Queues
DynamoDB → Tables
CloudWatch → Log groups
```

## 8. Xóa stack khi không dùng nữa

```bash
sam delete
```

Lưu ý: lệnh này có thể xóa các resource đã tạo bởi SAM stack.
