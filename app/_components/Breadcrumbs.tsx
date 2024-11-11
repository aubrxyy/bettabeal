import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

export default function BreadcrumbsComponent() {
  const pathname = usePathname();
  const pathnames = pathname.split('/').filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb" separator="/">
      <Link href="/" passHref>
        <Typography className='text-gray-400 mx-4'>Home</Typography>
      </Link>
      {pathnames.map((value, index) => {
        const isLast = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return isLast ? (
          <Link href={to} key={to} className="text-[#0F4A99] mx-4">
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Link>
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