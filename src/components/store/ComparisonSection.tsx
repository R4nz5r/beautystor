import { Check, X } from 'lucide-react';

const rows = [
  { feature: '১০০% অরিজিনাল প্রোডাক্ট', us: true, others: false },
  { feature: 'মানি-ব্যাক গ্যারান্টি', us: true, others: false },
  { feature: 'দ্রুত ডেলিভারি', us: true, others: false },
  { feature: 'কাস্টমার সাপোর্ট ২৪/৭', us: true, others: false },
  { feature: 'সাশ্রয়ী মূল্য', us: true, others: true },
  { feature: 'এক্সপায়ার্ড প্রোডাক্ট', us: false, others: true },
];

const ComparisonSection = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container max-w-2xl">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">অন্যরা vs আমরা</h2>
        <div className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-3 bg-muted font-medium text-sm">
            <div className="p-3">বৈশিষ্ট্য</div>
            <div className="p-3 text-center text-primary">আমরা</div>
            <div className="p-3 text-center text-muted-foreground">অন্যরা</div>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-3 border-t text-sm">
              <div className="p-3">{row.feature}</div>
              <div className="p-3 flex justify-center">
                {row.us ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-destructive" />}
              </div>
              <div className="p-3 flex justify-center">
                {row.others ? <Check className="h-5 w-5 text-green-500" /> : <X className="h-5 w-5 text-destructive" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
