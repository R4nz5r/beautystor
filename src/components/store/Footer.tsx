import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-lg font-bold text-background mb-3">বিউটি স্টোর</h3>
            <p className="text-sm text-background/60">বাংলাদেশের সেরা বিউটি প্রোডাক্টের বিশ্বস্ত ঠিকানা।</p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold text-background mb-3 text-sm">দ্রুত লিংক</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-background transition-colors">সকল প্রোডাক্ট</Link></li>
              <li><Link to="/category/skincare" className="hover:text-background transition-colors">স্কিনকেয়ার</Link></li>
              <li><Link to="/category/makeup" className="hover:text-background transition-colors">মেকআপ</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-background mb-3 text-sm">সহায়তা</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-background transition-colors">আমার অ্যাকাউন্ট</Link></li>
              <li><Link to="/cart" className="hover:text-background transition-colors">কার্ট</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-background mb-3 text-sm">যোগাযোগ</h4>
            <ul className="space-y-2 text-sm">
              <li>ফোন: ০১৭XXXXXXXX</li>
              <li>ইমেইল: info@beautystore.com</li>
              <li>ঢাকা, বাংলাদেশ</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-background/10">
        <div className="container py-4 text-center text-xs text-background/40">
          © ২০২৬ বিউটি স্টোর। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
};

export default Footer;
