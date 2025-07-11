import crypto from 'crypto';

export class FlowClient {
  private apiKey: string;
  private secretKey: string;
  private apiUrl: string;
  
  constructor() {
    this.apiKey = process.env.FLOW_API_KEY!;
    this.secretKey = process.env.FLOW_SECRET_KEY!;
    this.apiUrl = process.env.FLOW_API_URL || 'https://www.flow.cl/api';
  }
  
  async crearOrdenPago(params: {
    amount: number;
    subject: string;
    email: string;
    urlReturn: string;
    urlConfirmation: string;
  }) {
    const data = {
      apiKey: this.apiKey,
      commerceOrder: `ORD_${Date.now()}`,
      ...params
    };
    
    const signature = this.generarFirma(data);
    
    const response = await fetch(`${this.apiUrl}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, s: signature })
    });
    
    return response.json();
  }
  
  private generarFirma(data: any): string {
    const params = Object.keys(data)
      .sort()
      .map(key => `${key}${data[key]}`)
      .join('');
    
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(params)
      .digest('hex');
  }
}