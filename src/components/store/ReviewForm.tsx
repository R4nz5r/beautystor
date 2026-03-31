import { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface ReviewFormProps {
  productId: string;
  onSubmitted: () => void;
}

const ReviewForm = ({ productId, onSubmitted }: ReviewFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) { toast.error('মন্তব্য লিখুন'); return; }
    if (!name.trim() && !user) { toast.error('আপনার নাম লিখুন'); return; }

    setSubmitting(true);
    const { error } = await supabase.from('reviews').insert({
      product_id: productId,
      name: name.trim() || null,
      rating,
      comment: comment.trim(),
      user_id: user?.id || null,
    });

    if (error) {
      toast.error('রিভিউ সাবমিট করতে সমস্যা হয়েছে');
    } else {
      toast.success('রিভিউ সাবমিট করা হয়েছে! অ্যাডমিন অ্যাপ্রুভ করলে দেখা যাবে।');
      setName(''); setRating(5); setComment('');
      onSubmitted();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-5 bg-card">
      <h3 className="font-semibold mb-4">আপনার রিভিউ দিন</h3>
      
      {!user && (
        <div className="mb-3">
          <Input
            placeholder="আপনার নাম"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={100}
          />
        </div>
      )}

      <div className="flex items-center gap-1 mb-3">
        <span className="text-sm text-muted-foreground mr-2">রেটিং:</span>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHoverRating(i)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(i)}
            className="p-0.5"
          >
            <Star className={`h-5 w-5 transition-colors ${
              i <= (hoverRating || rating) ? 'fill-beauty-gold text-beauty-gold' : 'text-muted-foreground'
            }`} />
          </button>
        ))}
      </div>

      <div className="mb-4">
        <Textarea
          placeholder="আপনার মন্তব্য লিখুন..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
        />
      </div>

      <Button type="submit" disabled={submitting} size="sm">
        {submitting ? 'সাবমিট হচ্ছে...' : 'রিভিউ সাবমিট করুন'}
      </Button>
    </form>
  );
};

export default ReviewForm;
