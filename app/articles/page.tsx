'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Article {
  article_id: number;
  title: string;
  content: string;
  image: string;
}

export default function ArticlePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/article`);
        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }
        const data = await response.json();
        if (data.code === '000') {
          setArticles(data.articles);
        } else {
          throw new Error('Failed to fetch articles');
        }
      } catch (error) {
        setError((error as Error).message);
      }
    };

    fetchArticles();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-gray-100">
      <div className="container mx-auto py-16">
        <h1 className="text-4xl font-bold text-center text-blue-900">BETTABEAL ARTICLE</h1>
        <p className="text-md text-center text-blue-900 mt-2">
          Discover Fascinating Articles All About Betta Fish – Dive In Here!
        </p>

        <div className="grid grid-cols-1 gap-8 mt-10">
          {articles.map((article) => (
            <Link href={`/articles/${article.article_id}`}  key={article.article_id} className="flex bg-white rounded-lg w-full h-64 shadow-md hover:opacity-70 transition-all overflow-hidden">
              <Image src={`https://api.bettabeal.my.id${article.image}`} alt={article.title} width={100} height={100} className="size-64 shadow-2xl my-auto rounded-md object-cover" />
              <div className="p-6">
                <h2 className="text-xl font-bold text-blue-900">{article.title}</h2>
                <p className="text-sm text-gray-600 mt-2">
                  {article.content}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}