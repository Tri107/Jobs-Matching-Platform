import os
import boto3
from boto3.dynamodb.conditions import Key, Attr

class JobRepository:
    def __init__(self, table_name=None):
        self.table_name = table_name or os.environ.get("JOBS_TABLE")
        if not self.table_name:
            raise ValueError("JOBS_TABLE environment variable not configured")
        
        self.dynamodb = boto3.resource("dynamodb")
        self.table = self.dynamodb.Table(self.table_name)

    def find_by_hash(self, sha256_hash: str) -> list:
        response = self.table.query(
            IndexName="HashIndex",
            KeyConditionExpression=Key("hash").eq(sha256_hash)
        )
        return response.get("Items", [])

    def find_by_company(self, company_name: str) -> list:
        response = self.table.scan(
            FilterExpression=Attr("companyName").eq(company_name)
        )
        return response.get("Items", [])

    def insert(self, job_item: dict) -> None:
        self.table.put_item(Item=job_item)
