import { ShieldCheck } from 'lucide-react';

const MoneyBackBanner = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="bg-gradient-to-r from-primary/10 to-secondary rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <ShieldCheck className="h-16 w-16 text-primary flex-shrink-0" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">১০০% মানি-ব্যাক গ্যারান্টি</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              আমাদের যেকোনো প্রোডাক্ট ব্যবহার করে সন্তুষ্ট না হলে সম্পূর্ণ টাকা ফেরত পাবেন। কোনো প্রশ্ন করা হবে না।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoneyBackBanner;
