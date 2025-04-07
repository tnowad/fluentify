import { Injectable } from '@nestjs/common';
import { QdrantClient, Schemas } from '@qdrant/js-client-rest';

@Injectable()
export class QdrantService {
  private client: QdrantClient;

  constructor() {
    this.client = new QdrantClient({ url: process.env.QDRANT_URL! });
  }

  async upsertVector(
    collection: string,
    id: string,
    vector: number[],
    payload?: Schemas['Payload'],
  ) {
    await this.client.upsert(collection, {
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    });
  }

  async searchVectors(
    collection: string,
    vector: number[],
    limit = 5,
    filter?: Schemas['Filter'],
  ) {
    const result = await this.client.search(collection, {
      vector,
      limit,
      with_payload: true,
      filter,
    });

    return result;
  }

  async deleteVector(collection: string, id: string) {
    await this.client.delete(collection, {
      points: [id],
    });
  }

  async updateVector(
    collection: string,
    id: string,
    vector: number[],
    payload?: Schemas['Payload'],
  ) {
    await this.client.delete(collection, {
      points: [id],
    });

    await this.client.upsert(collection, {
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    });
  }
}
