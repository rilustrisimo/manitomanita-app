import Image from 'next/image';

export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Image 
        src="/logo.svg" 
        alt="ManitoManita Logo" 
        width={24} 
        height={24}
        className="w-6 h-6"
      />
      <span className="font-headline text-xl">
        <span className="font-bold" style={{ color: '#1b1b1b' }}>Manito</span>
        <span className="font-bold text-[#3ec7c2]">Manita</span>
      </span>
    </div>
  );
}
