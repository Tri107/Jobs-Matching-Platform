# Gemini CV Matching Evaluation Guide

## 1. Mục tiêu

CV Matching Flow dùng Gemini để đánh giá độ phù hợp giữa CV và Job.

Endpoint chính: `POST /cv/evaluate`.

Gemini thay thế Bedrock trong flow evaluate hiện tại. Đây là flow dùng Gemini trực tiếp.

## 2. Flow tổng quan

```text
Frontend/Postman
-> API Gateway POST /cv/evaluate
-> Cognito Authorizer xác thực user
-> Lambda evaluate-match
-> kiểm tra cvKey thuộc user
-> đọc job từ DynamoDB Jobs
-> Textract extract text từ CV trong S3
-> Gemini đánh giá CV text với job description
-> lưu kết quả vào DynamoDB MatchResultsTable
-> trả response về client
```

## 3. Model và secret

| Mục | Giá trị |
| --- | --- |
| Gemini model | `gemini-3.1-flash-lite` |
| SSM Parameter name | `/jobs-matching/dev/gemini-api-key` |
| Environment variable | `GEMINI_MODEL` |
| Environment variable | `GEMINI_API_KEY_PARAMETER_NAME` |

## 4. Tạo SSM Parameter

Tạo SecureString parameter chứa Gemini API key:

```powershell
aws ssm put-parameter `
  --name "/jobs-matching/dev/gemini-api-key" `
  --type "SecureString" `
  --value "PASTE_GEMINI_API_KEY_HERE" `
  --overwrite `
  --region ap-southeast-1
```

Kiểm tra parameter:

```powershell
aws ssm get-parameter `
  --name "/jobs-matching/dev/gemini-api-key" `
  --with-decryption `
  --region ap-southeast-1
```

## 5. Test API bằng Postman

Base URL dev hiện tại:

```text
https://38icub30ig.execute-api.ap-southeast-1.amazonaws.com/dev
```

Thứ tự test đề xuất:

1. `GET /health`
2. `GET /jobs?limit=5` hoặc `GET /jobs/search?limit=5`
3. Lấy Cognito ID token
4. `GET /cv/match-results`
5. `POST /cv/extract`
6. `POST /cv/evaluate`
7. `GET /cv/match-results`
8. `GET /cv/match-results/{matchId}`

## 6. Request mẫu `/cv/evaluate`

```http
POST /cv/evaluate
Authorization: Bearer <ID_TOKEN>
Content-Type: application/json
```

Body:

```json
{
  "jobId": "cbe79dc8-9aaf-4d6c-afcf-36db6533c304",
  "cvKey": "997ab59c-20b1-707d-4083-cb651fcdfb6f/cv_1782699166153.pdf"
}
```

`cvKey` phải bắt đầu bằng `userId/` của user trong Cognito token.

## 7. Response mẫu `/cv/evaluate`

```json
{
  "matchId": "d06123e2-93dd-4977-bf02-c8ed770a5fd9",
  "jobId": "cbe79dc8-9aaf-4d6c-afcf-36db6533c304",
  "jobTitle": "tester",
  "cvKey": "997ab59c-20b1-707d-4083-cb651fcdfb6f/cv_1782699166153.pdf",
  "pageCount": 1,
  "score": {
    "overallScore": 75,
    "skillsScore": 70,
    "experienceScore": 70,
    "educationScore": 85,
    "summary": "The candidate is a strong Information Technology student with solid fullstack development experience and familiarity with testing tools like Postman and jMeter. While they lack formal QA experience, their project-based background and technical skill set provide a good foundation for a Junior Tester role.",
    "strengths": [
      "Strong technical background in web development and API testing",
      "Familiarity with Postman and jMeter, which are relevant to QA",
      "Proven project management and collaboration skills",
      "Relevant degree in Information Technology"
    ],
    "weaknesses": [
      "No formal professional QA or software testing experience",
      "Missing formal certification such as ISTQB",
      "Lack of experience in formal test plan and script design documentation"
    ],
    "matchedSkills": [
      "JavaScript",
      "Java",
      "SQL",
      "Postman",
      "Jira"
    ],
    "missingSkills": [
      "Formal QA methodology implementation",
      "Test plan and test procedure design",
      "ISTQB certification",
      "Bug tracking and reporting lifecycle experience"
    ],
    "suggestions": [
      "Highlight any instances of writing unit or integration tests in current projects",
      "Pursue ISTQB Foundation Level certification to align with job requirements",
      "Emphasize the analytical and debugging skills used during the development of previous projects",
      "Clearly define any testing methodologies used (e.g., black-box, white-box testing) in personal projects"
    ]
  },
  "evaluatedAt": "2026-06-29T06:37:15.186Z"
}
```

## 8. CloudWatch log check

```powershell
aws logs tail /aws/lambda/jobs-matching-evaluate-match-dev `
  --since 30m `
  --follow `
  --region ap-southeast-1 `
```

Ví dụ kết quả tốt:

```text
status: success
durationMs: ~6855
billedDurationMs: ~7452
memorySizeMB: 256
maxMemoryUsedMB: 177
```

## 9. Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách xử lý |
| --- | --- | --- |
| `401`/`403` | Token sai/hết hạn hoặc cvKey không thuộc user | Lấy lại ID token, kiểm tra cvKey bắt đầu bằng userId |
| `ParameterNotFound` | Sai SSM parameter name hoặc sai region | Kiểm tra `/jobs-matching/dev/gemini-api-key` ở `ap-southeast-1` |
| `AccessDeniedException ssm:GetParameter` | Lambda role thiếu quyền SSM | Kiểm tra IAM policy của EvaluateMatchFunction role |
| `Missing Gemini API key` | Lambda không đọc được env/SSM | Kiểm tra `GEMINI_API_KEY_PARAMETER_NAME` và SSM |
| `quota` / `rate limit` | Gemini quota/rate limit | Chờ quota reset hoặc đổi quota/model |
| `Invalid JSON response` | Gemini trả không đúng JSON | Kiểm tra prompt, responseSchema, jsonParser |
| `Zod validation failed` | JSON thiếu/sai field | Kiểm tra Gemini schema và prompt |
| `Job not found` | Sai jobId | Lấy jobId từ `/jobs` |
| `Job description is required` | Job thiếu description | Chọn job khác có description |
| `NoSuchKey` | Sai cvKey | Kiểm tra S3 object key |
| Textract error | File không hỗ trợ hoặc quyền Textract lỗi | Kiểm tra file PDF/S3/Textract permission |

## 10. Cost/security notes

- `/cv/evaluate` có thể phát sinh chi phí vì đi qua Textract, Gemini, Lambda và CloudWatch.
- Không loop test nhiều lần.
- Không dùng CV thật với external AI provider nếu chưa rõ consent/data policy.
- Không log Gemini API key.
- Không log toàn bộ CV text.
- Không commit `.env`, `.env.local`, API key, token.
- Nếu secret từng bị paste vào chat/log/GitHub, nên rotate/regenerate.
- S3, DynamoDB, Lambda, CloudWatch, Textract, Gemini, SSM/KMS đều có thể phát sinh chi phí tùy usage.
