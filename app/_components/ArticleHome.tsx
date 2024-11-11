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
    fetch('https://api.bettabeal.my.id/api/article')
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
      <div className='mt-6 mb-20'>
        <h4 className='text-xl text-blue-800 underline underline-offset-8'>
          Articles
        </h4>
        <div className='flex flex-wrap mt-12 justify-center gap-5'>
          {articles.map(article => (
            <a key={article.article_id} href={`/article/${article.article_id}`} className='bg-gray-200 w-full max-sm:w-[90%] md:w-[48%] lg:w-[48%] h-[32rem] pb-20 rounded-xl'>
              <Image src={article.image ? `https://api.bettabeal.my.id${article.image}` : '/placeholder.png'} alt={article.title} width={700} height={500} className='w-full mx-auto h-72 object-cover'/>
              <h1 className={`${poppins.className} ml-4 mt-4 text-xl`}>
                {article.title}
              </h1>
              <p className={`${poppinsR.className} mx-4 text-sm mt-4 text-gray-500 leading-6 text-justify line-clamp-5`}>
                Lorem, ipsum dolor sit amet consectetur adipisicing elit. Consequatur, dolore? Eaque minima perferendis, sint, cupiditate possimus non est nobis ratione, esse vero dicta optio quis aliquam ipsam temporibus? Iure, exercitationem.
                Eius harum velit corporis recusandae aliquam quasi. Autem, quae assumenda illum saepe voluptatum impedit, recusandae accusantium facere ullam minus iure minima. Vel sequi quisquam enim quos rerum fugiat odit. Architecto?
                Nesciunt, quia, recusandae minima vero doloribus expedita corporis perspiciatis suscipit voluptate, fugit temporibus deleniti rerum fugiat itaque eaque eum autem veniam tempore illo illum iusto est numquam libero ut. Quo!
                Suscipit autem repudiandae id doloremque, magni vero tenetur in! Vitae consequuntur mollitia doloremque soluta accusamus! Maxime praesentium animi cumque vel, dicta ratione iste deleniti, eos facere rerum necessitatibus itaque reprehenderit.
                Laborum accusamus dolorem consequuntur quibusdam eos ipsum rerum nulla, similique reprehenderit! Unde amet soluta iusto quae sint aliquam voluptatem distinctio numquam sunt provident vel minima dignissimos, velit ipsa? Quis, harum?
                Perferendis dicta placeat, mollitia rerum dolore exercitationem amet labore maxime provident soluta iure veritatis non reiciendis qui voluptas, minus tempore nihil. Pariatur illum inventore nisi ullam dolores totam aperiam nam?
                Id deserunt maiores nostrum accusantium eveniet, cumque animi magnam adipisci et dolores quod porro culpa, atque aliquid debitis facilis asperiores amet! Ab commodi deserunt tempora, fugiat eaque laborum amet voluptas.
                Nesciunt, iure enim. Iste sit ad deserunt neque quis quisquam pariatur iure maiores, eveniet ipsa numquam quod perferendis earum expedita, consequuntur ullam tenetur recusandae veritatis eligendi ratione voluptatum soluta! Voluptas.
                Enim minima laudantium, architecto, excepturi atque doloremque, itaque commodi quia vitae expedita quaerat distinctio dicta velit quam cupiditate? Vero dicta eligendi, officia accusamus dignissimos error quos fugit quam odio fugiat.
                Dolor eum quisquam velit consequuntur commodi, in nemo incidunt eveniet illum eaque repellendus quaerat tenetur? Aperiam dolor non blanditiis optio, repellendus debitis soluta nostrum, excepturi fugiat minus pariatur enim beatae?
                Mollitia, exercitationem eum officiis nulla nam quia, rem sint quas, saepe voluptatibus nesciunt! Veniam non ex culpa iusto maxime odit officia distinctio dolorum doloremque dolore, aspernatur, recusandae labore quasi inventore!
                Architecto ipsum, impedit libero labore voluptatem dolorem fugiat, placeat culpa vero fuga doloribus explicabo, perspiciatis adipisci deleniti ullam id saepe quis eum distinctio deserunt laborum vel commodi. Magni, consequatur tempora.
                Maxime, sunt hic quod ea tempore incidunt esse, earum blanditiis ducimus minima deserunt? Suscipit ea quos odio at non assumenda sint reprehenderit? Ducimus soluta repellendus, corrupti ratione laboriosam officia tenetur!
                Unde consequatur impedit molestiae voluptate cumque odio saepe recusandae quas totam in ab vitae id tempora quis, aspernatur hic voluptatibus similique natus perspiciatis accusantium dicta! Minima asperiores eum aliquam officia.
                Eius ipsum nisi quasi quidem aut culpa laboriosam tenetur fugit distinctio accusamus minima repudiandae pariatur, corporis a illum blanditiis impedit fuga sequi deserunt repellat. Necessitatibus modi obcaecati explicabo quas laboriosam.
                Aspernatur debitis illum ex ullam harum eligendi, voluptates ut nulla molestiae, repellendus animi maxime repudiandae aperiam id porro neque quisquam commodi consectetur, hic voluptatem laboriosam magni nostrum? Possimus, recusandae magnam?
                Quasi iusto inventore mollitia consequuntur tenetur accusamus? Id commodi eligendi exercitationem eos minus aliquid reprehenderit nobis fugit a maiores sunt beatae sint temporibus, placeat, repellat amet omnis quis consequatur enim.
                Quasi id nostrum quaerat ratione ullam obcaecati adipisci? Accusantium voluptas porro sunt. Natus voluptatem fugiat cum quae, esse necessitatibus consectetur iusto. Voluptates doloribus vero qui nobis nemo nulla modi ex.
                Non magnam reiciendis illo earum, culpa ipsum fugit cupiditate nihil voluptates beatae numquam, quisquam at soluta facilis omnis molestias ut qui rerum quia aliquam, animi quod fuga ex amet. Adipisci?
                Quidem sit culpa ullam. Omnis, impedit. Enim, iste officiis? Cupiditate doloribus illo fuga amet voluptas temporibus recusandae? Repellat incidunt itaque rerum, voluptatibus voluptates labore. Quis labore iure harum laudantium quidem!
              </p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}