import { Gift } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Gift className="h-6 w-6 text-accent" />
      <span className="font-bold text-xl text-primary font-headline">ManitoMatch</span>
    </div>
  );
}
