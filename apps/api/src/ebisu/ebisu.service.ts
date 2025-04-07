import { Injectable } from '@nestjs/common'
import {
  defaultModel,
  predictRecall,
  updateRecall,
  modelToPercentileDecay,
} from 'ebisu-js'
import { Model } from 'ebisu-js/interfaces'

@Injectable()
export class EbisuService {
  createModel(t: number, alpha = 4, beta = alpha): Model {
    return defaultModel(t, alpha, beta)
  }

  predict(model: Model, elapsed: number, exact = false): number {
    return predictRecall(model, elapsed, exact)
  }

  update(
    model: Model,
    successes: number,
    total: number,
    elapsed: number,
    rebalance = true,
    q0?: number,
    tback?: number,
  ): Model {
    return updateRecall(model, successes, total, elapsed, q0, rebalance, tback)
  }

  getHalfLife(model: Model, percentile = 0.5): number {
    return modelToPercentileDecay(model, percentile)
  }
}
