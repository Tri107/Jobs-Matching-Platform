# Hướng dẫn Kiểm thử CV Matching Flow

Tài liệu này hướng dẫn kiểm thử trực tiếp trên **AWS Lambda Console** (không cần Postman hay token).

---

## I. Chuẩn bị dữ liệu

Trước khi test, cần có sẵn 3 thứ:

### 1. `userId` — lấy từ S3

Vào **S3 Console → bucket `jobs-matching-cvs-dev-<accountId>`**.  
Tên folder cấp 1 chính là `userId`, ví dụ: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 2. `cvKey` — lấy từ S3

Trong folder `userId/` → xem tên file thực tế.  
`cvKey` = `userId/cv_1750123456789.pdf`

### 3. `jobId` — lấy từ DynamoDB

Vào **DynamoDB Console → Tables → `jobs-matching-jobs-dev` → Explore items**.  
Copy một `jobId` bất kỳ mà trường `description` **không rỗng**.

---

## II. Test từng Lambda

### Lambda 1: `jobs-matching-extract-cv-dev`

Vào Lambda Console → chọn function → tab **Test** → **Create new event**.

**Event JSON:**
```json
{
  "routeKey": "POST /cv/extract",
  "isBase64Encoded": false,
  "body": "{\"cvKey\": \"THAY_USER_ID/THAY_TEN_FILE.pdf\"}",
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "THAY_USER_ID"
        }
      }
    }
  },
  "headers": {
    "content-type": "application/json"
  }
}
```

**Ví dụ thực tế:**
```json
{
  "routeKey": "POST /cv/extract",
  "isBase64Encoded": false,
  "body": "{\"cvKey\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890/cv_1750123456789.pdf\"}",
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        }
      }
    }
  },
  "headers": {
    "content-type": "application/json"
  }
}
```

**Response thành công (`statusCode: 200`):**
```json
{
  "statusCode": 200,
  "body": "{\"cvKey\":\"a1b2c3d4.../cv_175....pdf\",\"pageCount\":2,\"wordCount\":487,\"text\":\"Nguyen Van A\\nSoftware Engineer\\nSkills: Node.js...\"}"
}
```

---

### Lambda 2: `jobs-matching-evaluate-match-dev`

Đây là pipeline chính: Textract → Bedrock → DynamoDB.

**Event JSON:**
```json
{
  "routeKey": "POST /cv/evaluate",
  "isBase64Encoded": false,
  "body": "{\"jobId\": \"THAY_JOB_ID\", \"cvKey\": \"THAY_USER_ID/THAY_TEN_FILE.pdf\"}",
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "THAY_USER_ID"
        }
      }
    }
  },
  "headers": {
    "content-type": "application/json"
  }
}
```

**Ví dụ thực tế:**
```json
{
  "routeKey": "POST /cv/evaluate",
  "isBase64Encoded": false,
  "body": "{\"jobId\": \"550e8400-e29b-41d4-a716-446655440000\", \"cvKey\": \"a1b2c3d4-e5f6-7890-abcd-ef1234567890/cv_1750123456789.pdf\"}",
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        }
      }
    }
  },
  "headers": {
    "content-type": "application/json"
  }
}
```

**Response thành công (`statusCode: 200`):**
```json
{
  "statusCode": 200,
  "body": "{\"matchId\":\"...\",\"jobTitle\":\"Backend Developer\",\"score\":{\"overallScore\":72,\"skillsScore\":80,\"experienceScore\":65,\"educationScore\":75,\"summary\":\"...\",\"matchedSkills\":[\"Node.js\"],\"missingSkills\":[\"Docker\"]},\"evaluatedAt\":\"2026-06-24T10:05:00.000Z\"}"
}
```

> Sau khi nhận `statusCode: 200`, vào **DynamoDB → `jobs-matching-match-results-dev`** để xác nhận kết quả đã được lưu.

---

### Lambda 3: `jobs-matching-get-match-results-dev`

**Lấy toàn bộ kết quả của user:**
```json
{
  "routeKey": "GET /cv/match-results",
  "isBase64Encoded": false,
  "body": null,
  "pathParameters": {},
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "THAY_USER_ID"
        }
      }
    }
  },
  "headers": {}
}
```

**Lấy một kết quả cụ thể theo `matchId`:**
```json
{
  "routeKey": "GET /cv/match-results/{matchId}",
  "isBase64Encoded": false,
  "body": null,
  "pathParameters": {
    "matchId": "THAY_MATCH_ID"
  },
  "requestContext": {
    "authorizer": {
      "jwt": {
        "claims": {
          "sub": "THAY_USER_ID"
        }
      }
    }
  },
  "headers": {}
}
```

---

## III. Đọc kết quả trên Lambda Console

Sau khi nhấn **Test**:

- **Execution result** → xem `statusCode` và parse `body` (bị stringify 1 lớp)
- **Function logs** (ngay bên dưới) → CloudWatch log real-time, xem chi tiết lỗi nếu có

Nếu `statusCode: 200` → test thành công.

---

## IV. Xử lý lỗi Bedrock quota

Nếu nhận `statusCode: 429` với message `"AI service is temporarily busy"`:

Account mới bị giới hạn quota Bedrock về 0 cho cross-region inference. Cần request tăng quota:

1. Vào **AWS Console → Service Quotas → AWS Services → Amazon Bedrock**
2. Tìm `On-demand model inference requests per minute for Anthropic Claude 3 Haiku`
3. **Request increase** → Value: `10`
4. Tìm `On-demand model inference tokens per minute for Anthropic Claude 3 Haiku`
5. **Request increase** → Value: `10000`

Approve trong 5–30 phút. Sau đó test lại.

---

## V. Lỗi phổ biến

| `statusCode` | Message | Nguyên nhân | Xử lý |
| :---: | :--- | :--- | :--- |
| 401 | `Unauthorized` | Thiếu `sub` trong `requestContext` | Kiểm tra JSON event có đúng cấu trúc không |
| 403 | `Access denied` | `sub` trong `requestContext` khác prefix của `cvKey` | `userId` trong `sub` phải khớp với phần trước `/` của `cvKey` |
| 404 | `Job not found` | `jobId` không tồn tại trong DynamoDB | Lấy lại `jobId` đúng từ DynamoDB Console |
| 404 | `CV not found` | `cvKey` không tồn tại trên S3 | Lấy lại `cvKey` đúng từ S3 Console |
| 422 | `Job has no description` | Job trong DynamoDB thiếu trường `description` | Chọn job khác có `description` |
| 422 | `Could not extract text` | PDF là ảnh scan, không có text layer | Upload lại CV dạng PDF text thực |
| 429 | `AI service is temporarily busy` | Bedrock quota = 0 | Request tăng quota theo mục IV |
| 500 | `...is not configured` | Thiếu biến môi trường | Kiểm tra stack đã deploy thành công chưa |
