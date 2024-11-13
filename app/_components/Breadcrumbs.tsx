import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

export default function BreadcrumbsComponent() {
  const pathname = usePathname();
  const pathnames = pathname.split('/').filter((x) => x);
  const [productName, setProductName] = useState<string | null>(null);
  const [, setCategoryName] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async (id: string) => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setProductName(data.data.product_name);
          setCategoryName(data.data.category.category_name);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
    };

    if (pathnames.length > 1 && pathnames[0] === 'catalog') {
      const productId = pathnames[1];
      fetchProductDetails(productId);
    }
  }, [pathnames]);

  return (
    <Breadcrumbs aria-label="breadcrumb" separator="/">
      <Link href="/" passHref>
        <Typography className='text-gray-400 mx-4'>Home</Typography>
      </Link>
      {pathnames[0] === 'catalog' && (
        <>
          <Link href="/catalog" passHref>
            <Typography className={pathnames.length === 1 ? 'text-[#0F4A99] mx-4' : 'text-gray-400 mx-4'}>Catalog</Typography>
          </Link>
        </>
      )}
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        if (isLast && pathnames[0] === 'catalog' && productName) {
          return (
            <Typography key={to} className="text-[#0F4A99] mx-4">
              {productName}
            </Typography>
          );
        }

        if (value === 'catalog') {
          return null;
        }

        return isLast ? (
          <Typography key={to} className="text-[#0F4A99] mx-4">
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Typography>
        ) : (
          <Link href={to} key={to} passHref>
            <Typography className='text-gray-400 mx-4'>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Typography>
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}