import { ArticleHome } from './_components/ArticleHome';
import { Hero } from './_components/Hero';
import { NewArrival } from './_components/NewArrival';

export default function Home() {

  return (
    <>
      <Hero />
      <NewArrival />
      <ArticleHome />
    </>
  );
}