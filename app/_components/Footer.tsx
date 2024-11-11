import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({
  subsets: ['latin'],
  weight: '600',
});

export function Footer() {
  return (
    <footer className="bg-[#0F4A99] text-white">
      <div className="container mx-auto py-20 px-8 sm:px-16">
        <div className="flex max-sm:flex-wrap justify-between gap-8">
          <div className="w-full lg:w-1/2">
            <Image src="/logowhite.png" alt="Logo" width={110} height={100} />
            <p className="w-full min-w-[30ch] lg:w-[50ch] text-justify text-sm mt-6 leading-7">
              Temukan keindahan dan keunikan ikan cupang terbaik di sini. Kami menghadirkan koleksi ikan cupang berkualitas dengan variasi warna memukau dan karakter yang kuat. Dari penggemar pemula hingga kolektor berpengalaman, BettaBeal adalah tempat yang tepat untuk mempercantik akuarium Anda.
            </p>
            <div className="flex flex-row mt-12 space-x-8">
              <a href="/">
                <Image src="/X-Logo.png" alt="Twitter" width={20} height={20} />
              </a>
              <a href="/">
                <Image src="/fb-logo.png" alt="Facebook" width={20} height={20} />
              </a>
              <a href="/">
                <Image src="/ig-logo.png" alt="Instagram" width={20} height={20} />
              </a>
              <a href="/">
                <Image src="/wa-logo.png" alt="WhatsApp" width={20} height={20} />
              </a>
            </div>
          </div>
          <div className="w-full lg:w-1/2 sm:ml-40">
            <p className={`${inter.className} mt-8 lg:mt-0`}>Servis</p>
            <ul className="mt-4">
              <li className="mt-4 text-sm text-gray-400 hover:text-white hover:underline underline-offset-4 transition-all">
                <a href="/">Informasi Ikan</a>
              </li>
              <li className="mt-4 text-sm text-gray-400 hover:text-white hover:underline underline-offset-4 transition-all">
                <a href="/">Artikel Ikan</a>
              </li>
              <li className="mt-4 text-sm text-gray-400 hover:text-white hover:underline underline-offset-4 transition-all">
                <a href="/">Pembayaran</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}