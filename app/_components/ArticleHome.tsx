import { Poppins } from 'next/font/google';
import Image from 'next/image';

const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
})

const poppinsR = Poppins({
    subsets: ['latin'],
    weight: '400',
    })

export function ArticleHome() {
  return (
    <div className='sm:mx-8 md:mx-20 lg:mx-36 flex justify-center flex-col'>
        <div className='mt-6 mb-20'>
          <h4 className='text-xl text-blue-800 underline underline-offset-8'>
            Articles
          </h4>
                <div className='flex flex-wrap mt-12 justify-center gap-5'>
                  <a href='/article1' className='bg-gray-200 w-full max-sm:w-[90%] md:w-[48%] lg:w-[48%] h-fit pb-20 rounded-xl'>
                    <Image src="/articledummy.png" alt='Article 1' width={700} height={500} className='w-full mx-auto'/>
                    <h1 className={`${poppins.className} ml-4 mt-4 text-xl`}>
                      Black Samurai, Ikan Cupang Langka Bernilai Fantastis
                    </h1>
                    <p className={`${poppinsR.className} mx-4 text-sm mt-4 text-gray-500 leading-6 text-justify`}>
                      Bagi Anda yang hobi memelihara ikan cupang, pasti sudah tidak asing lagi kalau hewan air yang satu ini bisa memiliki harga fantastis. Dari 50-an jenis ikan cupang yang ada di Indonesia, hanya ada sekitar lima jenis saja yang dijual dengan harga tinggi, salah satunya adalah jenis cupang black samurai.
                    </p>
                  </a>
                  
                  <a href='/article2' className='bg-gray-200 w-full max-sm:w-[90%] md:w-[48%] lg:w-[48%] h-fit pb-20 rounded-xl'>
                    <Image src="/articledummy.png" alt='Article 2' width={700} height={500} className='w-full mx-auto'/>
                    <h1 className={`${poppins.className} ml-4 mt-4 text-xl`}>
                      Rahasia Pesona Ikan Cupang: Keindahan dan Perawatan yang Menakjubkan
                    </h1>
                    <p className={`${poppinsR.className} mx-4 text-sm mt-4 text-gray-500 leading-6 text-justify`}>
                     Ikan cupang adalah salah satu ikan hias yang paling digemari di dunia karena warna-warnanya yang mencolok dan keindahan siripnya yang khas. Di balik penampilannya yang menarik, ikan cupang juga dikenal sebagai ikan yang mudah dipelihara dengan perawatan yang tepat. Dalam artikel ini, kita akan membahas rahasia pesona ikan cupang, termasuk bagaimana cara memelihara mereka agar tetap sehat dan berwarna cerah.
                    </p>
                  </a>
                </div>
        </div>
      </div>

  );
}