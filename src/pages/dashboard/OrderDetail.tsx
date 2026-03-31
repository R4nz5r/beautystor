import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import jsPDF from 'jspdf';

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const statusLabels: Record<string, string> = {
  pending: 'পেন্ডিং', confirmed: 'কনফার্মড', processing: 'প্রসেসিং', shipped: 'শিপড', delivered: 'ডেলিভারড', cancelled: 'বাতিল',
};
const stepColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-cyan-500',
  delivered: 'bg-green-500',
};

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    supabase.from('orders').select('*').eq('id', id).single()
      .then(({ data }) => { if (data) setOrder(data); });
    supabase.from('order_items').select('*').eq('order_id', id)
      .then(({ data }) => { if (data) setItems(data); });
  }, [id]);

  const downloadInvoice = () => {
    if (!order) return;
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Invoice - Beauty Store', 20, 20);
    doc.setFontSize(11);
    doc.text(`Order ID: ${order.id}`, 20, 35);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 20, 42);
    doc.text(`Customer: ${order.customer_name || 'N/A'}`, 20, 49);
    doc.text(`Phone: ${order.phone || 'N/A'}`, 20, 56);
    doc.text(`Payment: ${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online'}`, 20, 63);

    let y = 80;
    doc.setFontSize(12);
    doc.text('Product', 20, y);
    doc.text('Qty', 120, y);
    doc.text('Price', 150, y);
    y += 8;
    doc.setFontSize(10);
    items.forEach(item => {
      doc.text(item.product_name, 20, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`${item.price * item.quantity} BDT`, 150, y);
      y += 7;
    });
    y += 5;
    doc.setFontSize(11);
    doc.text(`Subtotal: ${order.subtotal} BDT`, 120, y);
    doc.text(`Delivery: ${order.delivery_charge} BDT`, 120, y + 7);
    doc.text(`Total: ${order.total} BDT`, 120, y + 14);

    doc.save(`invoice-${order.id.slice(0, 8)}.pdf`);
  };

  if (!order) return <p className="text-muted-foreground">লোড হচ্ছে...</p>;

  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div>
      <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="h-4 w-4" /> ফিরে যান
      </Link>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">অর্ডার #{order.id.slice(0, 8)}</h2>
        <Button size="sm" variant="outline" onClick={downloadInvoice} className="gap-1">
          <Download className="h-4 w-4" /> ইনভয়েস
        </Button>
      </div>

      {/* Order tracking timeline */}
      {order.status !== 'cancelled' && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${i <= currentStep ? (stepColors[step] || 'bg-primary') : 'bg-muted text-muted-foreground'}`}>
                  {i + 1}
                </div>
                <span className="text-xs mt-1 text-center">{statusLabels[step]}</span>
              </div>
            ))}
          </div>
          <div className="h-1 bg-muted rounded-full relative mx-4">
            <div className="h-1 bg-primary rounded-full transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }} />
          </div>
        </div>
      )}

      {order.status === 'cancelled' && <Badge variant="destructive" className="mb-4">বাতিল করা হয়েছে</Badge>}

      {/* Order items */}
      <div className="border rounded-lg divide-y mb-4">
        {items.map(item => (
          <div key={item.id} className="flex justify-between p-3 text-sm">
            <span>{item.product_name} x{item.quantity}</span>
            <span className="font-medium">৳{item.price * item.quantity}</span>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-1 text-sm">
        <div className="flex justify-between"><span>সাবটোটাল</span><span>৳{order.subtotal}</span></div>
        <div className="flex justify-between"><span>ডেলিভারি</span><span>৳{order.delivery_charge}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-2"><span>মোট</span><span className="text-primary">৳{order.total}</span></div>
      </div>

      {order.tracking_number && (
        <p className="mt-4 text-sm text-muted-foreground">ট্র্যাকিং নম্বর: <span className="font-mono">{order.tracking_number}</span></p>
      )}
    </div>
  );
};

export default OrderDetail;
