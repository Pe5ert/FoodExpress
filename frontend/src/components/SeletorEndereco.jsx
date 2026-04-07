import { MapPin, ChevronDown } from 'lucide-react';

export default function AddressSelector() {
  return (
    <button className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl cursor-pointer shadow-lg transition-all border border-transparent min-w-70 font-medium hover:-translate-y-px hover:shadow-xl hover:border-primary group">
      <MapPin size={18} className="text-primary shrink-0" />
      <span className="font-semibold text-sm text-text-primary flex-1 text-left">Av. Principal, 123</span>
      <ChevronDown size={16} className="text-text-secondary shrink-0 transition-transform group-hover:rotate-180" />
    </button>
  );
}
