'use client';

import { Poppins } from 'next/font/google';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const poppins = Poppins({
  subsets: ['latin'],
  weight: '600',
});

const poppinsR = Poppins({
  subsets: ['latin'],
  weight: '400',
});

const poppinsB = Poppins({
  subsets: ['latin'],
  weight: '700',
});

interface Article {
  article_id: number;
  title: string;
  content: string;
  image: string | null;
  seller_id: number;
  created_at: string;
  updated_at: string;
}

export function ArticleHome() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    setFade(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article`)
      .then(response => response.json())
      .then(data => {
        if (data.code === '000') {
          setArticles(data.articles);
        }
        setTimeout(() => setFade(false), 500);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
        setFade(false);
      });
  }, []);

  return (
    <div className={`transition-opacity duration-500 ${fade ? 'opacity-0' : 'opacity-100'} sm:mx-8 md:mx-20 lg:mx-36 flex justify-center flex-col`}>
      <div className='mt-16 mb-20'>
        <h4 className={`${poppinsB.className} text-4xl text-[#0F4A99] flex flex-row text-nowrap`}>
            <div className='h-[0.125rem] w-8 bg-gray-300 mr-4 my-auto'></div> Recent Articles <div className='h-[0.125rem] w-full bg-gray-300 ml-4 my-auto'></div>
        </h4>
        <div className='flex flex-wrap mt-12 justify-center gap-5'>
          {articles.slice(0, 2).map(article => (
            <a key={article.article_id} href={`/article/${article.article_id}`} className='bg-gray-200 w-full max-sm:w-[90%] md:w-[48%] lg:w-[48%] h-[32rem] pb-20 rounded-xl'>
              <Image src={article.image ? `https://api.bettabeal.my.id${article.image}` : '/placeholder.png'} alt={article.title} width={700} height={500} className='w-full mx-auto h-72 object-cover rounded-tl-xl rounded-tr-xl'/>
              <h1 className={`${poppins.className} ml-4 mt-4 text-xl text-[#0F4A99] line-clamp-2`}>
                {article.title}
              </h1>
              <p className={`${poppinsR.className} mx-4 text-sm mt-2 text-gray-500 leading-6 text-justify line-clamp-5`}>
                {article.content}
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}