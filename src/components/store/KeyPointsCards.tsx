import { Shield, Truck, Headphones, CreditCard } from 'lucide-react';

const points = [
  { icon: Shield, title: '১০০% অরিজিনাল', desc: 'সকল প্রোডাক্ট সরাসরি ব্র্যান্ড থেকে সংগ্রহ করা' },
  { icon: Truck, title: 'দ্রুত ডেলিভারি', desc: 'ঢাকায় ২৪ ঘন্টা, ঢাকার বাইরে ৪৮ ঘন্টা' },
  { icon: Headphones, title: '২৪/৭ সাপোর্ট', desc: 'যেকোনো সমস্যায় আমরা সবসময় আছি' },
  { icon: CreditCard, title: 'সিকিউর পেমেন্ট', desc: 'ক্যাশ অন ডেলিভারি ও অনলাইন পেমেন্ট' },
];

const KeyPointsCards = () => {
  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">কেন আমাদের থেকে কিনবেন?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {points.map((p, i) => (
            <div key={i} className="bg-card border rounded-lg p-5 text-center hover:shadow-md transition-shadow">
              <p.icon className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h3 className="font-bold text-sm mb-1">{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyPointsCards;
