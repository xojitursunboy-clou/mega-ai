import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export default function Logo({ size = 'md', href = '/' }: LogoProps) {
  const sizes = { sm: 28, md: 34, lg: 42 };
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' };
  const px = sizes[size];

  const content = (
    <div className="flex items-center gap-2">
      <div style={{ width: px, height: px, position: 'relative', flexShrink: 0 }}>
        <Image
          src="/images/logo.png"
          alt="MegaAI Logo"
          fill
          className="object-contain"
          sizes={`${px}px`}
        />
      </div>
      <span className={`font-bold text-white ${textSizes[size]}`}>MegaAI</span>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
