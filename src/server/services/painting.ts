import { Painting } from "../db"

class PaintingService {
  create(
    name: string,
    owner: string,
    paintingHash: string,
    transactionHash: string,
    size: string,
    url: string,
  ): Promise<any> {
    return Painting.count({ where: { name } })
      .then((count) =>
        Painting.create({ name, nameOccurrence: (count + 1), owner, paintingHash, transactionHash, size, url })
      )
  }
}

export const paintingService = new PaintingService()
