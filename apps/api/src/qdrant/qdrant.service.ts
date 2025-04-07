import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  private client = new QdrantClient({ url: process.env.QDRANT_URL! });
}
