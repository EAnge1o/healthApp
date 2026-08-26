import { Response } from 'express';
import * as cardService from '../services/card.service';
import { AuthRequest } from '../middleware/auth';

export async function photoCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ code: 400, message: '请上传图片' });
      return;
    }

    const imageUrl = `/uploads/${file.filename}`;
    // 将图片转为 base64 供识别 API 使用
    const fs = await import('fs');
    const imageBase64 = fs.readFileSync(file.path).toString('base64');

    const recognized = await cardService.recognizeImage(imageBase64);
    const result = await cardService.savePhotoCard(req.userId!, imageUrl, recognized);

    res.json({ code: 200, message: '记卡成功', data: { ...result, recognized } });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function barcodeCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { barcode, imageUrl } = req.body;
    if (!barcode) {
      res.status(400).json({ code: 400, message: '条形码不能为空' });
      return;
    }

    const result_data = await cardService.queryBarcode(barcode);
    const result = await cardService.saveBarcodeCard(req.userId!, barcode, result_data, imageUrl || '');

    res.json({ code: 200, message: '记卡成功', data: { ...result, recognized: result_data } });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function getCardRecords(req: AuthRequest, res: Response): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const result = await cardService.getCardRecords(req.userId!, page, pageSize);
    res.json({ code: 200, message: 'ok', data: result });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function updateCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const { result } = req.body;
    await cardService.updateCardRecord(id, req.userId!, result);
    res.json({ code: 200, message: '已更新' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}

export async function deleteCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    const ok = await cardService.deleteCardRecord(id, req.userId!);
    if (!ok) { res.status(404).json({ code: 404, message: '记录不存在' }); return; }
    res.json({ code: 200, message: '已删除' });
  } catch (err: any) {
    res.status(500).json({ code: 500, message: err.message });
  }
}
