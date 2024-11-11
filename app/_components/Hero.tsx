import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const interR = Inter({
  subsets: ['latin'],
  weight: '400',
})

const interB = Inter({
  subsets: ['latin'],
  weight: '800',
})

export function Hero() {
  return (
    <>
      <div className={`gradient-bg w-full h-[67.5%]`}>
          <div className="container mx-auto flex flex-col lg:flex-row h-full justify-center items-center px-4 lg:px-0">
            <div className="flex justify-center flex-col text-white text-center lg:text-left mb-8 lg:mb-0">
              <div className="opacity-50 text-2xl lg:mb-4 ">Betta</div>
              <div className="flex items-baseline text-5xl lg:text-8xl lg:mb-4 mb-2">
                <span className={`${interR.className}`}>Crown</span>
                <p className={`${interB.className}`}>tail</p>
              </div>
              <div className="w-full lg:w-[60ch] mb-4">Cupang crown tail menjadi mendunia karena variasi keindahannya. Disebut crown tail atau ekor mahkota, karena bila dibalik menghadap ke atas serit-serit pada ekornya terlihat seperti mahkota raja.</div>
              <Link href="/catalog" className="border-[1px] w-fit px-8 py-3 rounded-md border-white mx-auto lg:mx-0 button-slide">
                <span>Shop now</span>
              </Link>
              </div>
            <div className="flex justify-center">
              <Image src="/herofish1.png" alt="Ikan" width={600} height={600} className="w-full max-w-xs lg:max-w-none lg:h-[35rem] lg:w-[35rem]"/>
            </div>
          </div>
      </div>
    </>
  );
}